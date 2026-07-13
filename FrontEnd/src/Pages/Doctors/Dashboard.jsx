import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NavBarDoctors, Footer } from "../../Components";
import axiosClient from "../../AxiosClient";
import { logout } from "../../Redux/SliceAuthDoctor";
import { remove } from "../../Services/LocalStorageService";
import GetAuthDoctor from "../../hooks/GetAuthDoctor";
import { useToast } from "../../Context/ToastContext.jsx";
import {
  UserIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/20/solid";

const Dashboard = () => {
  document.title = "Doctor Dashboard - DocAppoint";
  const doctorAuth = useSelector((state) => state.AuthDoctor);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  GetAuthDoctor();

  // Active Tab state
  const [activeTab, setActiveTab] = useState("dashboard");

  // Doctor Info & Appointment Data states
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [, setLoading] = useState(true);

  // Stats
  const [patientsCount, setPatientsCount] = useState(0);

  // Selected Patient Details modal
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Status Actions Feedback
  const [actionSuccess, setActionSuccess] = useState("");

  // Availability Form States
  const [availForm, setAvailForm] = useState({
    day_debut_work: "Monday",
    day_fin_work: "Friday",
    time_debut_work: "09:00",
    time_fin_work: "17:00",
    available: "1" // Vacation mode tracker
  });
  const [availSuccess, setAvailSuccess] = useState("");

  // Edit Profile Form States
  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    specialite: "",
    nom_cabinet: "",
    address_cabinet: "",
    about: "",
    phoneNumber: ""
  });
  const [profileSuccess, setProfileSuccess] = useState("");

  // Messages Mock States
  const [chatMessages, setChatMessages] = useState([
    { sender: "patient", text: "Hello Dr., is it normal to feel slightly dizzy after taking the pills?", time: "09:15 AM" },
    { sender: "doctor", text: "Some minor dizziness can occur. Please stay hydrated and rest. Let me check your lab report.", time: "09:20 AM" },
    { sender: "patient", text: "Okay, thank you. I've uploaded my latest x-ray file.", time: "09:22 AM" }
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Patient Reviews states
  const [reviewsList, setReviewsList] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});

  const doctorId = doctorAuth.doctor?.id;

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

  // Fetch all doctor profile & appointments details
  const fetchDoctorData = useCallback(() => {
    if (!doctorId) return;
    setLoading(true);
    
    // 1. Fetch Profile Details
    axiosClient
      .get(`/doctor_view/${doctorId}`)
      .then((res) => {
        const data = res.data;
        setDoctorInfo(data);
        setAvailForm({
          day_debut_work: data.day_debut_work || "Monday",
          day_fin_work: data.day_fin_work || "Friday",
          time_debut_work: data.time_debut_work || "09:00",
          time_fin_work: data.time_fin_work || "17:00",
          available: String(data.available)
        });
        setProfileForm({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          specialite: data.specialite || "",
          nom_cabinet: data.nom_cabinet || "",
          address_cabinet: data.address_cabinet || "",
          about: data.about || "",
          phoneNumber: data.phoneNumber || ""
        });
      })
      .catch((err) => console.error("Error loading doctor profile:", err));

    // 2. Fetch Today's Appointments
    axiosClient
      .get(`/doctor/appointmenttoday/${doctorId}`)
      .then((res) => {
        setTodayAppointments(res.data || []);
      })
      .catch((err) => console.error(err));

    // 3. Fetch Upcoming Appointments
    axiosClient
      .get(`/doctor/newappointment/${doctorId}`)
      .then((res) => {
        setUpcomingAppointments(res.data || []);
      })
      .catch((err) => console.error(err));

    // 4. Fetch Past Appointments
    axiosClient
      .get(`/doctor/appointmentoldday/${doctorId}`)
      .then((res) => {
        setPastAppointments(res.data || []);
        
        // Count unique patients
        const appts = res.data || [];
        const uniquePatientIds = new Set(appts.map((a) => a.user_id));
        setPatientsCount(uniquePatientIds.size);
      })
      .catch((err) => console.error(err));

    // 5. Fetch doctor reviews list from database
    axiosClient
      .get(`/doctor/reviews/all/${doctorId}`)
      .then((res) => {
        setReviewsList(res.data || []);
      })
      .catch((err) => console.error("Error loading doctor reviews:", err));

    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId, fetchDoctorData]);

  const handleLogout = () => {
    axiosClient
      .post("/user/logout") // Sanctum auth logout
      .then((res) => {
        if (res.status === 200) {
          dispatch(logout());
          remove("TOKEN_DOCTOR");
          navigate("/Connexion");
        }
      })
      .catch((err) => {
        console.error("Logout failed:", err);
      });
  };

  const handleAcceptAppointment = (id) => {
    setActionSuccess("");
    // We update local state to reflect accepted status
    setTodayAppointments(todayAppointments.map(a => a.id === id ? { ...a, status: "Accepted" } : a));
    setUpcomingAppointments(upcomingAppointments.map(a => a.id === id ? { ...a, status: "Accepted" } : a));
    setActionSuccess("Appointment accepted successfully!");
    showToast("Appointment accepted successfully!", "success");
    setTimeout(() => setActionSuccess(""), 4000);
  };

  const handleRejectAppointment = (id) => {
    if (!window.confirm("Are you sure you want to cancel/reject this appointment?")) return;
    setActionSuccess("");
    axiosClient
      .post(`/appointment/cancel/${id}`)
      .then((res) => {
        if (res.data.success) {
          // Remove from upcoming lists
          setTodayAppointments(todayAppointments.filter(a => a.id !== id));
          setUpcomingAppointments(upcomingAppointments.filter(a => a.id !== id));
          setActionSuccess("Appointment rejected/cancelled successfully.");
          showToast("Appointment rejected successfully.", "success");
          setTimeout(() => setActionSuccess(""), 4000);
        }
      })
      .catch((err) => {
        console.error("Error cancelling appointment:", err);
        showToast("Failed to reject appointment.", "error");
      });
  };

  const handleCompleteAppointment = (id) => {
    setActionSuccess("");
    // Find the completed appt
    const completed = todayAppointments.find(a => a.id === id) || upcomingAppointments.find(a => a.id === id);
    if (!completed) return;

    // Move to past list
    setPastAppointments([completed, ...pastAppointments]);
    setTodayAppointments(todayAppointments.filter(a => a.id !== id));
    setUpcomingAppointments(upcomingAppointments.filter(a => a.id !== id));

    setActionSuccess("Appointment marked as completed!");
    showToast("Appointment marked as completed!", "success");
    setTimeout(() => setActionSuccess(""), 4000);
  };

  const handleAvailabilitySubmit = (e) => {
    e.preventDefault();
    setAvailSuccess("");
    axiosClient
      .post("/doctor/update/info/time", {
        id: doctorId,
        day_debut_work: availForm.day_debut_work,
        day_fin_work: availForm.day_fin_work,
        time_debut_work: availForm.time_debut_work,
        time_fin_work: availForm.time_fin_work,
        available: availForm.available
      })
      .then((res) => {
        if (res.data.success) {
          setAvailSuccess("Working schedule and availability status updated successfully!");
          showToast("Working schedule and availability status updated!", "success");
          // Reload doctor details
          fetchDoctorData();
        }
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to update availability schedule.", "error");
      });
  };

  const handleProfileUpdateSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess("");
    
    // We update using update/info/time route since it saves doctor details or mock details
    axiosClient
      .post("/doctor/update/info/time", {
        id: doctorId,
        day_debut_work: availForm.day_debut_work,
        day_fin_work: availForm.day_fin_work,
        time_debut_work: availForm.time_debut_work,
        time_fin_work: availForm.time_fin_work,
        available: availForm.available,
        // Mock save the rest of the profile values
        firstname: profileForm.firstname,
        lastname: profileForm.lastname,
        specialite: profileForm.specialite,
        nom_cabinet: profileForm.nom_cabinet,
        address_cabinet: profileForm.address_cabinet,
        about: profileForm.about,
        phoneNumber: profileForm.phoneNumber
      })
      .then((res) => {
        if (res.data.updated === "success") {
          setProfileSuccess("Doctor profile info updated successfully!");
          showToast("Doctor profile updated successfully!", "success");
          fetchDoctorData();
        }
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to update profile info.", "error");
      });
  };

  const handleReplySubmit = (e, reviewId) => {
    e.preventDefault();
    const replyText = replyTexts[reviewId];
    if (!replyText) return;

    axiosClient
      .post("/review/reply", {
        review_id: reviewId,
        reply: replyText,
      })
      .then((res) => {
        if (res.data.success) {
          // Re-fetch reviews
          axiosClient
            .get(`/doctor/reviews/all/${doctorId}`)
            .then((r) => setReviewsList(r.data || []))
            .catch((err) => console.error(err));
          
          setReplyTexts(prev => ({ ...prev, [reviewId]: "" }));
          alert("Reply submitted successfully!");
        }
      })
      .catch((err) => console.error("Error submitting doctor reply:", err));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages([...chatMessages, { sender: "doctor", text: newMessage, time: timeStr }]);
    setNewMessage("");

    // Simulate reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: "patient", text: "Thanks for the response, Dr.! I will monitor my symptoms.", time: timeStr }
      ]);
    }, 1500);
  };

  // Get unique patient records
  const uniquePatients = [];
  const patientIds = new Set();
  [...todayAppointments, ...upcomingAppointments, ...pastAppointments].forEach((appt) => {
    if (appt.user && !patientIds.has(appt.user.id)) {
      patientIds.add(appt.user.id);
      uniquePatients.push({
        user: appt.user,
        appointmentDate: appt.date_appointment,
        type: appt.type_appointment
      });
    }
  });

  return (
    <>
      <NavBarDoctors />
      
      {/* Sidebar and Grid Container */}
      <div className="flex pt-16 overflow-hidden bg-gray-50/50 min-h-screen">
        
        {/* Sidebar Nav */}
        <aside className="fixed top-16 left-0 z-20 flex-col flex-shrink-0 w-64 h-full pt-1 pb-4 transition-width duration-75 hidden lg:flex bg-white border-r border-gray-200">
          <div className="flex flex-col flex-1 min-h-0 pt-4 overflow-y-auto">
            <div className="flex-1 px-4 space-y-1 bg-white">
              
              {/* Doctor Details Summary */}
              {doctorInfo && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-6 text-left">
                  <img 
                    src={getDoctorAvatar(doctorInfo.avatar_doctor)} 
                    alt="" 
                    className="w-12 h-12 rounded-lg object-cover border border-blue-100" 
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-gray-800 text-sm truncate">Dr. {doctorInfo.lastname}</h4>
                    <p className="text-[10px] text-blue-600 font-semibold truncate">{doctorInfo.specialite}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1 text-left">
                {[
                  { id: "dashboard", label: "Dashboard Overview", icon: UserIcon },
                  { id: "patients", label: "Patients", icon: UserGroupIcon },
                  { id: "appointments", label: "Appointments Directory", icon: CalendarDaysIcon },
                  { id: "reviews", label: "Patient Reviews", icon: StarIcon },
                  { id: "messages", label: "Messages", icon: ChatBubbleLeftRightIcon },
                  { id: "availability", label: "Working Schedule", icon: ClockIcon },
                  { id: "profile", label: "Edit Profile", icon: Cog6ToothIcon }
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSelectedPatient(null);
                      }}
                      className={`flex items-center gap-3 w-full py-3 px-4 text-sm font-semibold rounded-xl transition ${
                        activeTab === item.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full py-3 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition mt-6"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </nav>

            </div>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="relative w-full h-full overflow-y-auto bg-gray-50/20 ml-0 lg:ml-64 p-4 md:p-8 text-left">
          
          {/* Mobile Panel Selector */}
          <div className="lg:hidden mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Select Panel</label>
            <select
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value);
                setSelectedPatient(null);
              }}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition font-semibold cursor-pointer"
            >
              <option value="dashboard">Dashboard Overview</option>
              <option value="patients">Patients</option>
              <option value="appointments">Appointments Directory</option>
              <option value="reviews">Patient Reviews</option>
              <option value="messages">Messages</option>
              <option value="availability">Working Schedule</option>
              <option value="profile">Edit Profile</option>
            </select>
          </div>
          
          {actionSuccess && (
            <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl border border-green-100 mb-6 text-center font-semibold flex items-center justify-center gap-1.5">
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
              {actionSuccess}
            </div>
          )}

          {/* TAB 1: DOCTOR DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              
              {/* Doctor Header Welcome */}
              {doctorInfo && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
                  <div className="relative z-10 space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold">Welcome back, Dr. {doctorInfo.firstname} {doctorInfo.lastname}!</h2>
                    <p className="text-blue-100 text-sm max-w-md">Manage your daily clinic calendar, view patient files, and set availability slots.</p>
                  </div>
                  <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none">
                    <ClockIcon className="w-40 h-40" />
                  </div>
                </div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Slots</p>
                  <p className="text-3xl font-extrabold text-blue-600 mt-2">{todayAppointments.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Checkups</p>
                  <p className="text-3xl font-extrabold text-blue-600 mt-2">{upcomingAppointments.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Patient Records</p>
                  <p className="text-3xl font-extrabold text-blue-600 mt-2">{patientsCount}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Vacation Mode</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        const newAvail = availForm.available === "1" ? "0" : "1";
                        setAvailForm(prev => ({ ...prev, available: newAvail }));
                        axiosClient.post("/doctor/update/info/time", {
                          id: doctorId,
                          day_debut_work: availForm.day_debut_work,
                          day_fin_work: availForm.day_fin_work,
                          time_debut_work: availForm.time_debut_work,
                          time_fin_work: availForm.time_fin_work,
                          available: newAvail
                        }).then(() => {
                          showToast(newAvail === "0" ? "Vacation Mode Activated!" : "Vacation Mode Deactivated. Available for booking!", "info");
                        }).catch(() => {
                          showToast("Failed to toggle Vacation Mode.", "error");
                        });
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        availForm.available === "0" ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        availForm.available === "0" ? "translate-x-5" : "translate-x-0"
                      }`}></span>
                    </button>
                    <span className="text-xs text-gray-500 font-bold uppercase">
                      {availForm.available === "0" ? "ON (Busy)" : "OFF (Active)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Appointments List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 px-1">Today's Appointment Log</h3>
                {todayAppointments.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center text-sm text-gray-500">
                    No appointments scheduled for today.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Time Slot</th>
                            <th className="px-6 py-4">Consult Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700 bg-white">
                          {todayAppointments.map((appt) => (
                            <tr key={appt.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                {appt.user ? `${appt.user.firstname} ${appt.user.lastname}` : "Patient"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">
                                {appt.time_appointment}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap capitalize">
                                {appt.type_appointment}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  appt.status === 'Accepted' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                  {appt.status || "Pending Approval"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                {appt.status !== 'Accepted' && (
                                  <button 
                                    onClick={() => handleAcceptAppointment(appt.id)}
                                    className="text-xs font-bold text-green-600 hover:text-green-700"
                                  >
                                    Accept
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleCompleteAppointment(appt.id)}
                                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                >
                                  Complete
                                </button>
                                <button 
                                  onClick={() => handleRejectAppointment(appt.id)}
                                  className="text-xs font-bold text-red-600 hover:text-red-700"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor Availability Settings Fast Access */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base">Quick Working hours Update</h3>
                <form onSubmit={handleAvailabilitySubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Start Day</label>
                    <select
                      value={availForm.day_debut_work}
                      onChange={(e) => setAvailForm({ ...availForm, day_debut_work: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
                    >
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">End Day</label>
                    <select
                      value={availForm.day_fin_work}
                      onChange={(e) => setAvailForm({ ...availForm, day_fin_work: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
                    >
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Start Hour</label>
                    <input 
                      type="text" 
                      value={availForm.time_debut_work}
                      onChange={(e) => setAvailForm({ ...availForm, time_debut_work: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <button className="bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition text-sm">
                    Save Hours
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: PATIENTS LIST */}
          {activeTab === "patients" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Patients Directory</h2>
                <p className="text-xs text-gray-400">Total list of patient records who have registered/booked consultations.</p>
              </div>

              {uniquePatients.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center text-sm text-gray-500">
                  No active patient records found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {uniquePatients.map((pat) => (
                    <div key={pat.user.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">
                          {pat.user.firstname.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{pat.user.firstname} {pat.user.lastname}</h4>
                          <p className="text-xs text-gray-400">{pat.user.email} • ID: #{pat.user.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPatient(pat.user)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 py-2 px-3 rounded-xl border border-blue-100 shrink-0"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* View Patient Details Modal Dialog */}
              {selectedPatient && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedPatient(null)}></div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md relative z-10 space-y-4 border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-50 pb-3">Patient Clinical Profile</h3>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Full Name</span>
                        <strong className="text-gray-800 text-base">{selectedPatient.firstname} {selectedPatient.lastname}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">National ID Card (CIN)</span>
                        <span className="text-gray-800 font-semibold">{selectedPatient.cin || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Email Address</span>
                        <span className="text-gray-800 font-semibold">{selectedPatient.email}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Phone Number</span>
                        <span className="text-gray-800 font-semibold">{selectedPatient.phoneNumber || "N/A"}</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4 space-y-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">General Clinical Notes</span>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Patient is active. No known drug allergies reported. Follow-up consultation scheduled for symptoms review.
                        </p>
                      </div>
                    </div>

                    <div className="text-right pt-2 border-t border-gray-50">
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="py-2 px-5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md"
                      >
                        Close Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: APPOINTMENTS DIRECTORY */}
          {activeTab === "appointments" && (
            <div className="space-y-8">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Appointments Directory</h2>
                <p className="text-xs text-gray-400">Total list of scheduled upcoming slots and history logs.</p>
              </div>

              {/* Upcoming / New appointments */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2">Upcoming Scheduled Slots</h3>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No upcoming consultations listed.</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appt) => (
                      <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {appt.user ? `${appt.user.firstname} ${appt.user.lastname}` : "Patient"}
                          </p>
                          <p className="text-xs text-blue-600 font-semibold">{appt.type_appointment} • ID: #{appt.user_id}</p>
                          <p className="text-xs text-gray-400 mt-1">Date: <strong className="text-gray-700">{appt.date_appointment}</strong> at <strong className="text-gray-700">{appt.time_appointment}</strong></p>
                        </div>
                        <div className="flex items-center gap-2">
                          {appt.status !== 'Accepted' && (
                            <button 
                              onClick={() => handleAcceptAppointment(appt.id)}
                              className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 py-2 px-4 rounded-xl border border-green-100"
                            >
                              Accept
                            </button>
                          )}
                          <button 
                            onClick={() => handleCompleteAppointment(appt.id)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 py-2 px-4 rounded-xl border border-blue-100"
                          >
                            Complete
                          </button>
                          <button 
                            onClick={() => handleRejectAppointment(appt.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 py-2 px-4 rounded-xl border border-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Historical past bookings */}
              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2">Historical Consultation Logs</h3>
                {pastAppointments.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No historical consultations found.</p>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments.map((appt) => {
                      const isCancelled = appt.cancel_appointment === "1";
                      return (
                        <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-75">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {appt.user ? `${appt.user.firstname} ${appt.user.lastname}` : "Patient"}
                            </p>
                            <p className="text-xs text-gray-400">{appt.type_appointment} • ID: #{appt.user_id}</p>
                            <p className="text-xs text-gray-400 mt-1">Date: {appt.date_appointment} at {appt.time_appointment}</p>
                          </div>
                          <div>
                            {isCancelled ? (
                              <span className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-100">
                                Cancelled
                              </span>
                            ) : (
                              <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-100">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: REVIEWS LIST */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Patient Feedback Reviews</h2>
                <p className="text-xs text-gray-400">View rating scores and review comments left by your patients.</p>
              </div>

              <div className="space-y-4">
                {reviewsList.map((rev, index) => {
                  const patientName = rev.user ? `${rev.user.firstname} ${rev.user.lastname}` : (rev.patientName || "Patient");
                  const revDate = rev.created_at ? new Date(rev.created_at).toLocaleDateString() : (rev.date || "");
                  return (
                    <div key={rev.id || index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{patientName}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            rev.status === "approved" ? "bg-green-50 text-green-700 border-green-100" :
                            rev.status === "rejected" ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-yellow-50 text-yellow-700 border-yellow-100"
                          }`}>
                            {rev.status || "Pending"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{revDate}</span>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <StarIcon key={i} className="w-4.5 h-4.5" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 italic">"{rev.comment}"</p>
                      
                      {/* Reply section */}
                      {rev.reply ? (
                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-1">
                          <p className="text-xs font-bold text-purple-800">Your Reply:</p>
                          <p className="text-xs text-purple-700 italic">"{rev.reply}"</p>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleReplySubmit(e, rev.id)} className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write a public reply to this review..."
                            value={replyTexts[rev.id] || ""}
                            onChange={(e) => setReplyTexts({ ...replyTexts, [rev.id]: e.target.value })}
                            className="flex-1 bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-blue-500 transition"
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                          >
                            Reply
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
                {reviewsList.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No patient feedback reviews found.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Patient Consultation Messenger</h2>
                <p className="text-xs text-gray-400">Simulate direct secure chat channels with active patients.</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px]">
                
                {/* Chat Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    P
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Karim Benjelloun (Patient)</p>
                    <p className="text-[10px] text-green-500 font-semibold">Active Consultation Support</p>
                  </div>
                </div>

                {/* Chat Body messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                        msg.sender === 'doctor' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <span className={`text-[9px] block text-right mt-1 ${msg.sender === 'doctor' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-3 bg-white flex gap-2">
                  <input 
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 transition"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shrink-0"
                  >
                    Send Reply
                  </button>
                </form>

              </div>
            </div>
          )}

          {/* TAB 6: AVAILABILITY SETTINGS */}
          {activeTab === "availability" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Manage Working Hours & Vacation Mode</h2>
                <p className="text-xs text-gray-400">Configure operating hours, calendar days, and vacation status.</p>
              </div>

              {availSuccess && (
                <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl border border-green-100 text-center font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircleIcon className="w-5 h-5 shrink-0" />
                  {availSuccess}
                </div>
              )}

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <form onSubmit={handleAvailabilitySubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Start Day</label>
                      <select
                        value={availForm.day_debut_work}
                        onChange={(e) => setAvailForm({ ...availForm, day_debut_work: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition"
                      >
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">End Day</label>
                      <select
                        value={availForm.day_fin_work}
                        onChange={(e) => setAvailForm({ ...availForm, day_fin_work: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition"
                      >
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Start Hour</label>
                      <input 
                        type="text" 
                        required
                        value={availForm.time_debut_work}
                        onChange={(e) => setAvailForm({ ...availForm, time_debut_work: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">End Hour</label>
                      <input 
                        type="text" 
                        required
                        value={availForm.time_fin_work}
                        onChange={(e) => setAvailForm({ ...availForm, time_fin_work: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition text-sm shadow-sm">
                      Save Availability Settings
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* TAB 7: EDIT PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Update Profile Details</h2>
                <p className="text-xs text-gray-400">Keep clinic names, specialties, and bios up to date.</p>
              </div>

              {profileSuccess && (
                <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl border border-green-100 text-center font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircleIcon className="w-5 h-5 shrink-0" />
                  {profileSuccess}
                </div>
              )}

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        required
                        value={profileForm.firstname}
                        onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        required
                        value={profileForm.lastname}
                        onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medical Specialty</label>
                      <input 
                        type="text" 
                        required
                        value={profileForm.specialite}
                        onChange={(e) => setProfileForm({ ...profileForm, specialite: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinic Name</label>
                      <input 
                        type="text" 
                        required
                        value={profileForm.nom_cabinet}
                        onChange={(e) => setProfileForm({ ...profileForm, nom_cabinet: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinic Address</label>
                      <input 
                        type="text" 
                        required
                        value={profileForm.address_cabinet}
                        onChange={(e) => setProfileForm({ ...profileForm, address_cabinet: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="text" 
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Biography</label>
                      <textarea
                        rows="4"
                        value={profileForm.about}
                        onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="text-right pt-2">
                    <button className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition text-sm shadow-sm">
                      Save Profile Info
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </div>

      </div>

      <Footer />
    </>
  );
};

export default Dashboard;
