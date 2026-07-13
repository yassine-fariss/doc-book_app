import React, { useEffect, useState } from "react";
import { DataPicker, Footer, Header } from "../Components";
import ComplitedAppointment from "./ComplitedAppointment";
import {
  ClipboardDocumentCheckIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from "@heroicons/react/20/solid";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../AxiosClient";
import { useToast } from "../Context/ToastContext";
import { useDispatch, useSelector } from "react-redux";
import { addUserData } from "../Redux/SliceAuthUser";
import { get } from "../Services/LocalStorageService";

const BookingAppointment = () => {
  document.title = "Book Appointment - DocAppoint";

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [doctorData, setDoctorData] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservedSlots, setReservedSlots] = useState([]);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState(id);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [bookingError, setBookingError] = useState("");

  const [showCompletedAppointment, setShowCompletedAppointment] = useState(false);
  const [filePath, setFilePath] = useState("");

  const userData = useSelector((state) => state.authUser);

  // Authenticate user on load
  useEffect(() => {
    if (
      userData.isAuthenticated &&
      get("TOKEN_USER") &&
      userData.user === null
    ) {
      axiosClient
        .get("/user")
        .then((re) => {
          dispatch(addUserData(re.data));
        })
        .catch(() => {
          navigate("/connexion");
        });
    }
  }, [dispatch, navigate, userData.isAuthenticated, userData.user]);

  // Fetch doctors lists
  useEffect(() => {
    setLoading(true);
    axiosClient
      .post("/search/doctors", {
        specialite: "",
        address_cabinet: "",
        firstname: "",
        nom_cabinet: "",
      })
      .then((res) => {
        const list = res.data.DataSearch || [];
        setAllDoctors(list);
        
        const activeDoc = list.find((d) => String(d.id) === String(selectedDoctorId));
        if (activeDoc) {
          setDoctorData(activeDoc);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedDoctorId]);

  // Sync selectedDoctorId when route parameter changes
  useEffect(() => {
    if (id) {
      setSelectedDoctorId(id);
    }
  }, [id]);

  // Fetch reserved times when date is selected
  useEffect(() => {
    if (!selectedDate || !selectedDoctorId) {
      setReservedSlots([]);
      return;
    }
    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() + 1); // standard date shift
    const formattedDate = dateObj.toISOString().slice(0, 10);

    axiosClient
      .post("/appointment/reserved", {
        id: selectedDoctorId,
        dateApointment: formattedDate,
      })
      .then((res) => {
        setReservedSlots(res.data || []);
      })
      .catch((err) => {
        console.error("Error loading reserved slots:", err);
        setReservedSlots([]);
      });
  }, [selectedDate, selectedDoctorId]);

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedDoctorId) {
      setBookingError("Please select a doctor to continue.");
      return;
    }
    if (currentStep === 2 && !selectedDate) {
      setBookingError("Please select an appointment date.");
      return;
    }
    if (currentStep === 3 && !selectedTime) {
      setBookingError("Please select an available time slot.");
      return;
    }
    if (currentStep === 4 && (!selectedType || selectedType === "Type Appointment")) {
      setBookingError("Please select a consultation type.");
      return;
    }
    
    setBookingError("");
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setBookingError("");
    setCurrentStep(currentStep - 1);
  };

  const handleConfirmBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedType || !userData.user?.id) {
      setBookingError("Missing configuration values. Please review steps.");
      return;
    }

    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() + 1);
    const formattedDate = dateObj.toISOString().slice(0, 10);

    axiosClient
      .post("/take/appointment", {
        user_id: userData.user.id,
        doctor_id: selectedDoctorId,
        date_appointment: formattedDate,
        time_appointment: selectedTime,
        type_appointment: selectedType,
        notes: patientNotes
      })
      .then((res) => {
        showToast("Appointment booked successfully!", "success");
        setFilePath(res.data.namefile);
        setShowCompletedAppointment(true);
      })
      .catch((err) => {
        console.error("Take appointment error:", err);
        let errMsg = "Failed to book appointment. Please verify details.";
        if (err.response && err.response.status === 422) {
          errMsg = "This slot was just reserved by another patient. Please select a different slot.";
        }
        setBookingError(errMsg);
        showToast(errMsg, "error");
      });
  };

  const generateTimeSlots = (start, end, step) => {
    if (!start || !end) return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
    const slots = [];
    try {
      let current = new Date(`2026-01-01T${start}:00`);
      const stop = new Date(`2026-01-01T${end}:00`);
      const stepMin = parseInt(step) || 30;

      while (current < stop) {
        const hours = String(current.getHours()).padStart(2, '0');
        const mins = String(current.getMinutes()).padStart(2, '0');
        slots.push(`${hours}:${mins}`);
        current.setMinutes(current.getMinutes() + stepMin);
      }
    } catch (e) {
      return ["09:00", "10:00", "11:00", "14:00", "15:00"];
    }
    return slots;
  };

  const getDoctorAvatar = (avatar) => {
    if (!avatar) {
      return "/img/Rectangle 3.png";
    }
    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:")) {
      return avatar;
    }
    if (avatar.startsWith("/")) {
      return avatar;
    }
    return `http://127.0.0.1:8000/storage/images/doctors/${avatar}`;
  };

  const stepsList = [
    { number: 1, name: "Doctor" },
    { number: 2, name: "Date" },
    { number: 3, name: "Time Slot" },
    { number: 4, name: "Patient Details" },
    { number: 5, name: "Confirmation" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Header />
        <div className="flex justify-center items-center py-20 flex-1">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="mt-4 text-gray-500 font-medium">Loading Booking System...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const feeVal = doctorData ? (parseInt(doctorData.id) % 4) * 50 + 150 : 150;
  const timeSlots = doctorData ? generateTimeSlots(doctorData.time_debut_work, doctorData.time_fin_work, doctorData.appointment_time) : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between text-left">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-10 w-full flex-1">
        
        {/* Step Progress Bar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {stepsList.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className={`flex-1 h-0.5 mx-2 md:mx-4 ${currentStep >= step.number ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
                <div className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ${
                    currentStep === step.number 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md' 
                      : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {currentStep > step.number ? <CheckIcon className="w-5 h-5" /> : step.number}
                  </div>
                  <span className={`text-[10px] md:text-xs font-semibold mt-2 transition ${
                    currentStep === step.number ? 'text-blue-600 font-bold' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          
          {bookingError && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 mb-6 text-center font-medium">
              {bookingError}
            </div>
          )}

          {/* STEP 1: CHOOSE DOCTOR */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Select Doctor</h2>
                <p className="text-xs text-gray-400">Choose a practitioner from our directory.</p>
              </div>

              {doctorData ? (
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <img 
                    src={getDoctorAvatar(doctorData.avatar_doctor)} 
                    alt={`Dr. ${doctorData.firstname}`} 
                    className="w-20 h-20 rounded-xl object-cover border border-blue-200 shadow-inner shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <h3 className="font-bold text-gray-900 text-lg">Dr. {doctorData.firstname} {doctorData.lastname}</h3>
                    <p className="text-blue-600 font-semibold text-sm">{doctorData.specialite}</p>
                    <p className="text-xs text-gray-500">{doctorData.nom_cabinet || "Cabinet de consultation"} • {doctorData.address_cabinet}</p>
                    
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          setDoctorData(null);
                          setSelectedDoctorId("");
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-bold border-b border-dashed border-red-200"
                      >
                        Change Doctor
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 font-medium">Search and select a practitioner below:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto p-1">
                    {allDoctors.map((doc) => (
                      <div 
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoctorId(doc.id);
                          setDoctorData(doc);
                          setBookingError("");
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                          selectedDoctorId === doc.id
                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                            : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                        }`}
                      >
                        <img 
                          src={getDoctorAvatar(doc.avatar_doctor)} 
                          alt={`Dr. ${doc.firstname}`} 
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                        <div className="flex-1 space-y-0.5 overflow-hidden">
                          <p className="font-bold text-gray-900 text-sm truncate">Dr. {doc.firstname} {doc.lastname}</p>
                          <p className="text-xs text-blue-600 font-semibold truncate">{doc.specialite}</p>
                          <p className="text-[10px] text-gray-400 truncate">{doc.address_cabinet}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CHOOSE DATE */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Select Date</h2>
                <p className="text-xs text-gray-400">Choose a convenient calendar day for your consultation.</p>
              </div>

              <div className="max-w-sm mx-auto p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <DataPicker setSelectedDate={(d) => {
                    setSelectedDate(d);
                    setSelectedTime(""); // reset chosen time
                    setBookingError("");
                  }} />
                </div>
              </div>

              {selectedDate && (
                <div className="text-center text-sm font-semibold text-gray-700">
                  Selected: <span className="text-blue-600">{new Date(selectedDate).toDateString()}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CHOOSE AVAILABLE TIME */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Select Time Slot</h2>
                <p className="text-xs text-gray-400">Pick an active, non-reserved time slot on <strong className="text-blue-600">{new Date(selectedDate).toDateString()}</strong>.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => {
                    const isBooked = reservedSlots.includes(slot);
                    const isSelected = selectedTime === slot;
                    
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => {
                          setSelectedTime(slot);
                          setBookingError("");
                        }}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                          isBooked 
                            ? "bg-gray-100 border-gray-200 text-gray-400 line-through cursor-not-allowed" 
                            : isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                              : "bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                        }`}
                      >
                        {slot} {isBooked && "(Booked)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PATIENT INFORMATION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Patient Details & Type</h2>
                <p className="text-xs text-gray-400">Fill in patient health context and choose the consult type.</p>
              </div>

              {userData.isAuthenticated && get("TOKEN_USER") ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Form Details */}
                  <div className="space-y-4">
                    
                    {/* Appointment Type */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Appointment Type</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                          <ClipboardDocumentCheckIcon className="w-5 h-5" />
                        </div>
                        <select
                          onChange={(e) => {
                            setSelectedType(e.target.value);
                            setBookingError("");
                          }}
                          value={selectedType}
                          className="bg-gray-50 pl-10 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 outline-none transition"
                        >
                          <option>Type Appointment</option>
                          <option value="urgent">Urgent</option>
                          <option value="nouveau patient">Nouveau Patient</option>
                          <option value="suivi">Suivi</option>
                          <option value="diagnostic">Diagnostic</option>
                          <option value="consultation">Consultation</option>
                        </select>
                      </div>
                    </div>

                    {/* Medical Notes */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Reason for Visit / Medical Notes</label>
                      <textarea
                        rows="3"
                        placeholder="Describe your symptoms or reason for visit..."
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition"
                      />
                    </div>

                  </div>

                  {/* Right Column: Prepopulated Info */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 h-fit">
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      Patient Information (Profile)
                    </h4>
                    <div className="text-xs space-y-2 text-gray-600">
                      <div>
                        <span className="font-semibold block text-gray-400">Patient Name</span>
                        <span className="text-sm font-bold text-gray-800">{userData.user?.firstname} {userData.user?.lastname}</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-gray-400">Email Address</span>
                        <span className="text-sm font-bold text-gray-800">{userData.user?.email}</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-gray-400">Phone Number</span>
                        <span className="text-sm font-bold text-gray-800">{userData.user?.phoneNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <ShieldCheckIcon className="w-12 h-12 text-blue-500 mx-auto" />
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">Login Required</h4>
                    <p className="text-sm text-gray-500 mt-1">Please log in to your patient account to input patient information and book appointments.</p>
                  </div>
                  <button 
                    onClick={() => navigate("/Connexion")}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md"
                  >
                    Go to Login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: BOOKING CONFIRMATION */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Booking Summary</h2>
                <p className="text-xs text-gray-400">Review appointment details and finalize your booking slot.</p>
              </div>

              {doctorData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Summary List */}
                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-500">Doctor</span>
                        <span className="font-bold text-gray-800">Dr. {doctorData.firstname} {doctorData.lastname}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-500">Date</span>
                        <span className="font-bold text-blue-600">{new Date(selectedDate).toDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-500">Time Slot</span>
                        <span className="font-bold text-blue-600">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-500">Type</span>
                        <span className="font-bold text-gray-800 capitalize">{selectedType}</span>
                      </div>
                      {patientNotes && (
                        <div>
                          <span className="font-semibold text-gray-500 block">Symptoms / Notes</span>
                          <span className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100 block mt-1 leading-relaxed">{patientNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment checkout box */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                      <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
                      Consultation Checkout
                    </h4>
                    
                    <div className="text-xs space-y-2 text-gray-600 border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span>Doctor Consultation Fee:</span>
                        <span className="font-bold text-gray-800">{feeVal} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DocAppoint Platform Tax:</span>
                        <span className="font-bold text-green-600">0 MAD (Free)</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center font-bold text-base text-gray-800">
                      <span>Total Due:</span>
                      <span className="text-lg text-blue-600">{feeVal} MAD</span>
                    </div>

                    <div className="pt-2">
                      <form onSubmit={handleConfirmBookingSubmit}>
                        <button 
                          type="submit"
                          className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <CheckIcon className="w-5 h-5" />
                          Confirm & Book Appointment
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Footer Navigation Buttons inside Form Card */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition py-2.5 px-4 border border-gray-200 rounded-xl"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg"
              >
                Next
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <div></div>
            )}
          </div>

        </div>

      </main>

      <Footer />

      <ComplitedAppointment
        showComplitedAppointment={showCompletedAppointment}
        setShowComplitedAppointment={setShowCompletedAppointment}
        FilePath={filePath}
      />
    </div>
  );
};

export default BookingAppointment;
