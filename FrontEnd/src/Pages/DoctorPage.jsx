import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Footer, Header, DataPicker } from "../Components";
import { get } from "../Services/LocalStorageService";
import { addUserData } from "../Redux/SliceAuthUser";
import axiosClient from "../AxiosClient";
import ComplitedAppointment from "./ComplitedAppointment";
import { 
  ClockIcon, 
  ClipboardDocumentCheckIcon, 
  StarIcon, 
  CheckBadgeIcon, 
  AcademicCapIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  LanguageIcon,
  BookmarkSquareIcon,
  CalendarDaysIcon
} from "@heroicons/react/20/solid";

const DoctorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarDoctors, setSimilarDoctors] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  
  // Booking Form State
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showComplitedAppointment, setShowComplitedAppointment] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [bookingError, setBookingError] = useState("");

  const userData = useSelector((state) => state.authUser);

  // Load user details if authenticated
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
        .catch((er) => {
          console.error("Failed to load user profile", er);
        });
    }
  }, [userData.isAuthenticated, userData.user, dispatch]);

  // Fetch Doctor Profile and Similar Doctors
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/doctor_view/${id}`);
        const doctorData = response.data;
        setDoctor(doctorData);
        
        // Fetch similar doctors from the same specialty
        if (doctorData.specialite) {
          try {
            const similarResponse = await axiosClient.post("/search/doctors", {
              specialite: doctorData.specialite
            });
            // Filter out current doctor
            const filtered = (similarResponse.data.DataSearch || []).filter(
              (doc) => doc.id !== doctorData.id
            );
            setSimilarDoctors(filtered.slice(0, 3));
          } catch (err) {
            console.error("Error fetching similar doctors", err);
            setSimilarDoctors([]);
          }
        }
      } catch (error) {
        console.error("Error fetching doctor profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
    // Reset booking choices when changing doctor
    setSelectedDate("");
    setSelectedTime("");
    setSelectedType("");
    setBookingError("");

    // Fetch actual reviews for this doctor
    axiosClient.get(`/doctor/reviews/${id}`)
      .then((res) => {
        setReviewsList(res.data || []);
      })
      .catch((err) => console.error("Error loading doctor reviews:", err));
  }, [id]);

  // Fetch reserved slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setReservedSlots([]);
      return;
    }
    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() + 1); // standard date shift
    const formattedDate = dateObj.toISOString().slice(0, 10);

    axiosClient
      .post("/appointment/reserved", {
        id: id,
        dateApointment: formattedDate,
      })
      .then((res) => {
        setReservedSlots(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching reserved slots:", err);
        setReservedSlots([]);
      });
  }, [selectedDate, id]);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedType || selectedType === "Type Appointment") {
      setBookingError("Please select a date, time slot, and appointment type.");
      return;
    }
    setBookingError("");

    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() + 1); // Shifting timezone offset
    const formattedDate = dateObj.toISOString().slice(0, 10);

    axiosClient
      .post("/take/appointment", {
        user_id: userData.user?.id,
        doctor_id: id,
        date_appointment: formattedDate,
        time_appointment: selectedTime,
        type_appointment: selectedType,
      })
      .then((res) => {
        setFilePath(res.data.namefile);
        setShowComplitedAppointment(true);
      })
      .catch((err) => {
        console.error("Booking error:", err);
        setBookingError("Booking failed. Please check details and try again.");
      });
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

  const generateTimeSlots = (start, end, step) => {
    if (!start || !end) return ["09:00", "09:40", "10:20", "11:00", "11:40", "14:00", "14:40", "15:20", "16:00"];
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
      return ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];
    }
    return slots;
  };

  const getQualifications = (specialite) => {
    const spec = (specialite || "").toLowerCase();
    if (spec.includes("cardio")) {
      return [
        "Medical Doctor (M.D.) - Harvard Medical School",
        "Residency in Internal Medicine - Massachusetts General Hospital",
        "Fellowship in Cardiovascular Disease - Johns Hopkins Hospital"
      ];
    } else if (spec.includes("derm")) {
      return [
        "Medical Doctor (M.D.) - Stanford University School of Medicine",
        "Residency in Dermatology - Stanford Medical Center",
        "Fellowship in Clinical Dermatology - Stanford Hospital"
      ];
    } else if (spec.includes("neuro")) {
      return [
        "Medical Doctor (M.D.) - Columbia University Vagelos College",
        "Residency in Neurology - NewYork-Presbyterian Hospital",
        "Fellowship in Clinical Neurophysiology - Mayo Clinic"
      ];
    } else {
      return [
        "Medical Doctor (M.D.) - Columbia University Vagelos College",
        "Residency in Specialized Medicine - NewYork-Presbyterian Hospital",
        "Fellowship in General Clinical Care"
      ];
    }
  };

  const getCertificates = (specialite) => {
    const spec = (specialite || "").toLowerCase();
    if (spec.includes("cardio")) {
      return [
        "Board Certification in Cardiovascular Disease",
        "Fellow of the American College of Cardiology (FACC)",
        "Certified in Advanced Cardiac Life Support (ACLS)"
      ];
    } else if (spec.includes("derm")) {
      return [
        "Board Certification in Dermatology",
        "Fellow of the American Academy of Dermatology (FAAD)",
        "Certified Laser Specialist License"
      ];
    } else if (spec.includes("neuro")) {
      return [
        "Board Certification in Psychiatry and Neurology",
        "Member of the American Academy of Neurology (AAN)",
        "Accredited Neuro-Oncology License"
      ];
    } else {
      return [
        "Board Certified Specialist License",
        "National Council of Medical Board Accreditation",
        "Certified Advanced Clinical Medicine Practitioner"
      ];
    }
  };

  const getLanguagesList = (doctorId) => {
    const docId = parseInt(doctorId) || 0;
    if (docId % 3 === 0) {
      return ["Arabic", "French"];
    } else if (docId % 3 === 1) {
      return ["Arabic", "English"];
    } else {
      return ["Arabic", "French", "English"];
    }
  };

  // getMockReviews removed in favor of dynamic reviewsList state

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-[60vh]">
          <div role="status" className="flex flex-col items-center">
            <svg
              aria-hidden="true"
              className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="mt-4 text-gray-500 font-medium">Loading Doctor Profile...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!doctor) {
    return (
      <>
        <Header />
        <div className="flex flex-col justify-center items-center h-[50vh] text-center px-4">
          <h2 className="text-2xl font-bold text-gray-700">Doctor Profile Not Found</h2>
          <p className="text-gray-500 mt-2">The doctor you are looking for might have updated their information or been removed.</p>
          <Link to="/recherche" className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition">
            Search Doctors
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const expYears = (doctor.id % 12) + 6;
  const feeVal = (doctor.id % 4) * 50 + 150;
  const qualificationsList = getQualifications(doctor.specialite);
  const certificatesList = getCertificates(doctor.specialite);
  const languagesList = getLanguagesList(doctor.id);
  
  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
    : (doctor.rating || "4.8");
  const timeSlots = generateTimeSlots(doctor.time_debut_work, doctor.time_fin_work, doctor.appointment_time);
  
  const formattedWorkDays = doctor.day_debut_work && doctor.day_fin_work 
    ? `${doctor.day_debut_work} - ${doctor.day_fin_work}` 
    : "Monday - Friday";
  const formattedWorkHours = doctor.time_debut_work && doctor.time_fin_work 
    ? `${doctor.time_debut_work} - ${doctor.time_fin_work}` 
    : "09:00 - 17:00";

  return (
    <>
      <Header />
      
      {/* Banner / Cover */}
      <div className="relative h-[250px] bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" style={{ backgroundImage: "url('https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}></div>
        <div className="relative text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide uppercase">Doctor Profile</h1>
          <p className="mt-2 text-blue-100 font-light max-w-lg mx-auto">Get detailed professional insights and book your medical consultation online.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main Grid: Details + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main Doctor Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 transition-all hover:shadow-md">
              <div className="relative shrink-0">
                <img 
                  src={getDoctorAvatar(doctor.avatar_doctor)} 
                  alt={`Dr. ${doctor.firstname} ${doctor.lastname}`} 
                  className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-blue-50 shadow-inner" 
                />
                {doctor.verified && (
                  <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                    <CheckBadgeIcon className="w-5 h-5" />
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Dr. {doctor.firstname} {doctor.lastname}</h2>
                    {doctor.premium && (
                      <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase border border-blue-100 tracking-wider">Premium Partner</span>
                    )}
                  </div>
                  <p className="text-blue-600 font-semibold text-lg mt-1">{doctor.specialite || "Specialist"}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-4 max-w-md mx-auto md:mx-0">
                  <div className="text-center md:text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Experience</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">{expYears}+ Yrs</p>
                  </div>
                  <div className="text-center md:text-left border-l border-r border-gray-100 px-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Consultation</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">{feeVal} MAD</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rating</p>
                    <div className="flex items-center justify-center md:justify-start gap-1 mt-1 text-yellow-500">
                      <StarIcon className="w-5 h-5" />
                      <span className="text-lg font-bold text-gray-800">{averageRating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-3">Biography</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {doctor.about || `Dr. ${doctor.firstname} ${doctor.lastname} is an experienced healthcare specialist who is committed to providing outstanding medical care. With a focus on patient-centered diagnosis and modern therapeutic interventions, they ensure every individual receives tailored consultations and treatment protocols to optimize health outcomes and quality of life.`}
              </p>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-3">Education & Training</h3>
              <ul className="space-y-3">
                {qualificationsList.map((qual, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm md:text-base text-gray-600">
                    <AcademicCapIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certificates Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-3">Certificates & Accreditations</h3>
              <ul className="space-y-3">
                {certificatesList.map((cert, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm md:text-base text-gray-600">
                    <BookmarkSquareIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Languages Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-3">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {languagesList.map((lang, index) => (
                  <span key={index} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-blue-100">
                    <LanguageIcon className="w-4 h-4 text-blue-500" />
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Working Schedule & Available Slots Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <h3 className="text-xl font-bold text-gray-900">Working Schedule & Available Slots</h3>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Timezone: UTC+1</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <div className="flex items-start gap-3">
                  <BriefcaseIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Clinic Name</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{doctor.nom_cabinet || "Cabinet de Consultation"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{doctor.address_cabinet}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Phone: {doctor.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <ClockIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Consultation Schedule</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{formattedWorkDays}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Hours: {formattedWorkHours}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Slot Interval: {doctor.appointment_time || "30"} min</p>
                  </div>
                </div>
              </div>

              {/* Time Slots Selector Guide */}
              <div className="border-t border-gray-100 pt-6 space-y-4 text-left">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                  Daily Available Slots
                </h4>
                
                {selectedDate ? (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                      Showing slots for date: <strong className="text-blue-600">{new Date(selectedDate).toDateString()}</strong>. Click a slot to select it.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {timeSlots.map((slot) => {
                        const isBooked = reservedSlots.includes(slot);
                        const isSelected = selectedTime === slot;
                        
                        return (
                          <button
                            key={slot}
                            disabled={isBooked}
                            onClick={() => {
                              setSelectedTime(slot);
                              setBookingError("");
                            }}
                            className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                              isBooked 
                                ? "bg-gray-100 border-gray-200 text-gray-400 line-through cursor-not-allowed" 
                                : isSelected
                                  ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                            }`}
                          >
                            {slot} {isBooked && "(Booked)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-xl border border-blue-100 text-center font-medium">
                    Please select a date in the scheduling sidebar to load and choose from available slots.
                  </div>
                )}
              </div>
            </div>

            {/* Patient Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <h3 className="text-xl font-bold text-gray-900">Patient Reviews</h3>
                <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                  <StarIcon className="w-4 h-4" />
                  <span>{averageRating} / 5.0</span>
                </div>
              </div>
              <div className="space-y-5 divide-y divide-gray-50">
                {reviewsList.map((review, index) => {
                  const revName = review.user ? `${review.user.firstname} ${review.user.lastname}` : (review.name || "Patient");
                  const revDate = review.created_at ? new Date(review.created_at).toLocaleDateString() : (review.date || "");
                  return (
                    <div key={index} className={`pt-5 ${index === 0 ? 'pt-0' : ''} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center">
                            {revName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{revName}</p>
                            <p className="text-xs text-gray-400">{revDate}</p>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                      {review.reply && (
                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-1 ml-10">
                          <p className="text-xs font-bold text-purple-800">Doctor's Reply:</p>
                          <p className="text-xs text-purple-700 italic">"{review.reply}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                {reviewsList.length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">No approved reviews for this practitioner yet.</p>
                )}
              </div>
            </div>

            {/* Related Doctors Section */}
            {similarDoctors.length > 0 && (
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-gray-900 px-1">Related Doctors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {similarDoctors.map((simDoc) => (
                    <div key={simDoc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 flex flex-col items-center text-center space-y-3 transition hover:-translate-y-1 hover:shadow-md duration-200">
                      <img 
                        src={getDoctorAvatar(simDoc.avatar_doctor)} 
                        alt={`Dr. ${simDoc.firstname} ${simDoc.lastname}`} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-50"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Dr. {simDoc.firstname} {simDoc.lastname}</h4>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">{simDoc.specialite}</p>
                      </div>
                      <Link 
                        to={`/doctor/${simDoc.id}`} 
                        className="w-full text-center py-1.5 border border-blue-600 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-50 transition duration-200"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="bg-blue-600 text-white py-4 px-6 text-center">
                <h3 className="font-bold text-lg">Schedule Consultation</h3>
                <p className="text-xs text-blue-100 mt-0.5">Quick & Secure Online Booking</p>
              </div>
              
              <div className="p-6 text-left">
                {userData.isAuthenticated && get("TOKEN_USER") ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-5">
                    {bookingError && (
                      <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 text-center font-medium">
                        {bookingError}
                      </div>
                    )}
                    
                    {/* Date Picker */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <DataPicker setSelectedDate={setSelectedDate} />
                      </div>
                    </div>

                    {/* Slot Info */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Selected Slot</label>
                      <div className="bg-gray-50 border border-gray-200 text-sm rounded-xl py-2.5 px-4 font-semibold text-gray-700 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span>{selectedTime ? `${selectedTime} (Active)` : "Select slot from timeline grid"}</span>
                      </div>
                    </div>

                    {/* Appointment Type */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Appointment Type</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                          <ClipboardDocumentCheckIcon className="w-5 h-5" />
                        </div>
                        <select
                          onChange={handleTypeChange}
                          value={selectedType}
                          className="bg-gray-50 pl-10 pr-4 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition"
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

                    <div className="border-t border-gray-50 pt-4 text-xs space-y-1.5 text-gray-500">
                      <div className="flex justify-between">
                        <span>Consult Fee:</span>
                        <span className="font-semibold text-gray-800">{feeVal} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Tax:</span>
                        <span className="font-semibold text-gray-800">0 MAD (Free)</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 pt-1.5 font-bold text-sm text-gray-800">
                        <span>Total Due:</span>
                        <span className="text-blue-600">{feeVal} MAD</span>
                      </div>
                    </div>

                    {/* Submit Booking */}
                    <button className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition shadow-md hover:shadow-lg">
                      Confirm Booking
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 px-4 space-y-4">
                    <ShieldCheckIcon className="w-12 h-12 text-blue-500 mx-auto" />
                    <div>
                      <h4 className="font-bold text-gray-800">Authentication Required</h4>
                      <p className="text-xs text-gray-500 mt-1">Please log in to your patient account to book an appointment with Dr. {doctor.lastname}.</p>
                    </div>
                    <button 
                      onClick={() => navigate("/Connexion")}
                      className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition"
                    >
                      Login to Book
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
      
      {/* Success Modal */}
      <ComplitedAppointment
        showComplitedAppointment={showComplitedAppointment}
        setShowComplitedAppointment={setShowComplitedAppointment}
        FilePath={filePath}
      />
    </>
  );
};

export default DoctorPage;
