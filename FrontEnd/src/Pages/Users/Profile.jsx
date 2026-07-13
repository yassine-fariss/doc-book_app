import React, { useEffect, useState } from "react";
import { Footer, Header } from "../../Components";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../../AxiosClient";
import { logout, addUserData } from "../../Redux/SliceAuthUser";
import { useNavigate, Link } from "react-router-dom";
import { remove } from "../../Services/LocalStorageService";
import GetAuthUser from "../../hooks/GetAuthUser";
import { useToast } from "../../Context/ToastContext.jsx";
import { 
  UserIcon, 
  CalendarDaysIcon, 
  ClipboardDocumentListIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  ArrowPathIcon
} from "@heroicons/react/20/solid";

const Profile = () => {
  document.title = "Patient Dashboard - DocAppoint";
  const UserData = useSelector((state) => state.authUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  GetAuthUser();

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data States
  const [appointments, setAppointments] = useState([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  
  // Reschedule Form State
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReservedSlots, setRescheduleReservedSlots] = useState([]);
  
  // Review Modal State
  const [reviewingAppointment, setReviewingAppointment] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    cin: "",
    phoneNumber: ""
  });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Messaging Mock State
  const [chatMessages, setChatMessages] = useState([
    { sender: "doctor", text: "Hello! How can I help you today?", time: "10:30 AM" },
    { sender: "patient", text: "I wanted to follow up on my recent prescription details.", time: "10:32 AM" },
    { sender: "doctor", text: "Sure, let me check your diagnostic files. Everything looks good. Take it twice a day.", time: "10:35 AM" }
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Load patient appointments, favorites and reviews
  useEffect(() => {
    if (UserData.user?.id) {
      // 1. Fetch appointments
      axiosClient
        .get(`/user/appointments/${UserData.user.id}`)
        .then((res) => {
          setAppointments(res.data || []);
        })
        .catch((err) => console.error("Error loading appointments:", err));

      // 2. Fetch doctors to mock favorites
      axiosClient
        .post("/search/doctors", { specialite: "" })
        .then((res) => {
          const list = res.data.DataSearch || [];
          // Pick top 2 doctors as favorites for UI quality
          setFavoriteDoctors(list.slice(0, 2));
        })
        .catch((err) => console.error(err));

      // 3. Prepopulate Profile Edit Form
      setProfileForm({
        firstname: UserData.user.firstname || "",
        lastname: UserData.user.lastname || "",
        email: UserData.user.email || "",
        cin: UserData.user.cin || "",
        phoneNumber: UserData.user.phoneNumber || ""
      });

      // 4. Load user reviews
      axiosClient
        .get(`/user/reviews/${UserData.user.id}`)
        .then((res) => {
          setReviewsList(res.data || []);
        })
        .catch((err) => console.error("Error loading user reviews:", err));
    }
  }, [UserData.user]);

  // Load reserved slots when reschedule date is chosen
  useEffect(() => {
    if (!rescheduleDate || !reschedulingId) {
      setRescheduleReservedSlots([]);
      return;
    }
    const appt = appointments.find((a) => a.id === reschedulingId);
    if (!appt) return;

    const dateObj = new Date(rescheduleDate);
    dateObj.setDate(dateObj.getDate() + 1);
    const formattedDate = dateObj.toISOString().slice(0, 10);

    axiosClient
      .post("/appointment/reserved", {
        id: appt.doctor_id,
        dateApointment: formattedDate,
      })
      .then((res) => {
        setRescheduleReservedSlots(res.data || []);
      })
      .catch((err) => {
        console.error("Error loading reserved slots for reschedule:", err);
        setRescheduleReservedSlots([]);
      });
  }, [rescheduleDate, reschedulingId, appointments]);

  const handleLogout = () => {
    axiosClient
      .post("/user/logout")
      .then((res) => {
        if (res.status === 200) {
          dispatch(logout());
          remove("TOKEN_USER");
          navigate("/Connexion");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleCancelAppointment = (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    axiosClient
      .post(`/appointment/cancel/${id}`)
      .then((res) => {
        if (res.data.success) {
          // Update status in local state
          setAppointments(appointments.map(a => a.id === id ? { ...a, cancel_appointment: "1" } : a));
          showToast("Appointment cancelled successfully!", "success");
        }
      })
      .catch((err) => {
        console.error("Error cancelling appointment:", err);
        showToast("Failed to cancel appointment. Please try again.", "error");
      });
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime || !reschedulingId) return;

    const dateObj = new Date(rescheduleDate);
    dateObj.setDate(dateObj.getDate() + 1);
    const formattedDate = dateObj.toISOString().slice(0, 10);

    axiosClient
      .post("/appointment/reschedule", {
        id: reschedulingId,
        date_appointment: formattedDate,
        time_appointment: rescheduleTime
      })
      .then((res) => {
        if (res.data.success) {
          // Update slots locally
          setAppointments(appointments.map(a => 
            a.id === reschedulingId 
              ? { ...a, date_appointment: formattedDate, time_appointment: rescheduleTime, cancel_appointment: "0" } 
              : a
          ));
          setReschedulingId(null);
          setRescheduleDate("");
          setRescheduleTime("");
          showToast("Appointment rescheduled successfully!", "success");
        }
      })
      .catch((err) => {
        console.error("Reschedule error:", err);
        const errMsg = err.response?.data?.message || "Reschedule failed. Please try again.";
        showToast(errMsg, "error");
      });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewingAppointment) return;

    const appt = appointments.find((a) => a.id === reviewingAppointment);
    if (!appt || !appt.doctor) return;

    axiosClient
      .post("/review/create", {
        user_id: UserData.user.id,
        doctor_id: appt.doctor_id,
        rating: reviewRating,
        comment: reviewComment,
      })
      .then((res) => {
        if (res.data.success) {
          // Re-fetch user reviews to update list
          axiosClient
            .get(`/user/reviews/${UserData.user.id}`)
            .then((r) => setReviewsList(r.data || []))
            .catch((err) => console.error(err));
          
          setReviewingAppointment(null);
          setReviewComment("");
          showToast("Review submitted successfully! It will be visible once approved.", "success");
        }
      })
      .catch((err) => {
        console.error("Error submitting review:", err);
        showToast("Failed to submit review. Please try again.", "error");
      });
  };

  const handleProfileUpdateSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    axiosClient
      .put("/user/update", {
        id: UserData.user.id,
        firstname: profileForm.firstname,
        lastname: profileForm.lastname,
        email: profileForm.email,
        cin: profileForm.cin,
        phoneNumber: profileForm.phoneNumber
      })
      .then((res) => {
        // Sync Redux
        dispatch(addUserData(res.data.user || res.data));
        setProfileSuccess("Profile updated successfully!");
        showToast("Profile updated successfully!", "success");
      })
      .catch((err) => {
        console.error(err);
        setProfileError("Profile update failed. Verify fields.");
        showToast("Profile update failed. Verify fields.", "error");
      });
  };

  const handlePasswordUpdateSubmit = (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    axiosClient
      .post("/user/changepassword", {
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      })
      .then(() => {
        setPasswordSuccess("Password updated successfully!");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        showToast("Password updated successfully!", "success");
      })
      .catch((err) => {
        console.error(err);
        const errMsg = err.response?.data?.message || "Failed to update password. Verify old password.";
        setPasswordError(errMsg);
        showToast(errMsg, "error");
      });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages([...chatMessages, { sender: "patient", text: newMessage, time: timeStr }]);
    setNewMessage("");

    // Simulate reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: "doctor", text: "We have received your message. A clinic assistant will respond shortly.", time: timeStr }
      ]);
    }, 1500);
  };

  const getDoctorAvatar = (avatar) => {
    if (!avatar) return "/img/Rectangle 3.png";
    if (avatar.startsWith("http") || avatar.startsWith("/")) return avatar;
    return `http://127.0.0.1:8000/storage/images/doctors/${avatar}`;
  };

  const upcomingAppointments = appointments.filter(
    a => a.cancel_appointment !== "1" && new Date(a.date_appointment) >= new Date().setHours(0,0,0,0)
  );
  
  const pastAppointments = appointments.filter(
    a => a.cancel_appointment === "1" || new Date(a.date_appointment) < new Date().setHours(0,0,0,0)
  );

  const availableHours = ["09:00", "09:40", "10:20", "11:00", "11:40", "14:00", "14:40", "15:20", "16:00"];

  return (
    <>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Dashboard Grid: Sidebar (1 Col) + Content (3 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Nav */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 text-left">
            
            {/* User Profile Mini Header */}
            {UserData.user && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0 border border-blue-100 shadow-inner">
                  {UserData.user.firstname.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 truncate">
                    {UserData.user.firstname} {UserData.user.lastname}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold truncate uppercase tracking-wider">Patient ID: #{UserData.user.id}</p>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4">
              <nav className="flex flex-col gap-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: UserIcon },
                  { id: "appointments", label: "Appointments", icon: CalendarDaysIcon },
                  { id: "history", label: "Medical History", icon: ClipboardDocumentListIcon },
                  { id: "messages", label: "Messages", icon: ChatBubbleLeftRightIcon },
                  { id: "reviews", label: "Reviews", icon: StarIcon },
                  { id: "settings", label: "Account Settings", icon: Cog6ToothIcon }
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setReschedulingId(null);
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
                  className="flex items-center gap-3 w-full py-3 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition mt-4"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>

          </div>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Select Panel</label>
            <select
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value);
                setReschedulingId(null);
              }}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition font-semibold cursor-pointer"
            >
              <option value="dashboard">Dashboard</option>
              <option value="appointments">Appointments</option>
              <option value="history">Medical History</option>
              <option value="messages">Messages</option>
              <option value="reviews">Reviews</option>
              <option value="settings">Account Settings</option>
            </select>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-3">
            
            {/* VIEW 1: DASHBOARD OVERVIEW */}
            {activeTab === "dashboard" && UserData.user && (
              <div className="space-y-8 text-left">
                
                {/* Welcome Card Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
                  <div className="relative z-10 space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold">Welcome Back, {UserData.user.firstname}!</h2>
                    <p className="text-blue-100 text-sm max-w-md">Here is a quick summary of your upcoming clinic consultations and medical files.</p>
                  </div>
                  <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none">
                    <CalendarDaysIcon className="w-40 h-40" />
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Checkups</p>
                    <p className="text-3xl font-extrabold text-blue-600 mt-2">{upcomingAppointments.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Consults</p>
                    <p className="text-3xl font-extrabold text-blue-600 mt-2">{pastAppointments.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Starred Specialists</p>
                    <p className="text-3xl font-extrabold text-blue-600 mt-2">{favoriteDoctors.length}</p>
                  </div>
                </div>

                {/* Next Upcoming Appointment Alert */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 px-1">Upcoming Consultations</h3>
                  {upcomingAppointments.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center text-sm text-gray-500">
                      You have no upcoming consultations scheduled. 
                      <Link to="/recherche" className="text-blue-600 font-bold ml-1 hover:underline">Find a Doctor</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.slice(0, 2).map((appt) => (
                        <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {appt.doctor && (
                              <img 
                                src={getDoctorAvatar(appt.doctor.avatar_doctor)} 
                                alt="" 
                                className="w-12 h-12 rounded-lg object-cover" 
                              />
                            )}
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {appt.doctor ? `Dr. ${appt.doctor.firstname} ${appt.doctor.lastname}` : "Clinic Doctor"}
                              </p>
                              <p className="text-xs text-blue-600 font-semibold">{appt.doctor?.specialite || "Specialist"}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{appt.date_appointment} at {appt.time_appointment} • Type: <span className="capitalize">{appt.type_appointment}</span></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setReschedulingId(appt.id);
                                setActiveTab("appointments");
                              }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 py-2 px-4 rounded-xl border border-blue-100"
                            >
                              Reschedule
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(appt.id)}
                              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 py-2 px-4 rounded-xl border border-red-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favorite Doctors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 px-1">Favorite Practitioners</h3>
                  {favoriteDoctors.length === 0 ? (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center text-sm text-gray-500">
                      No starred practitioners yet. Browse and star doctors to see them here!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {favoriteDoctors.map((doc) => (
                        <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={getDoctorAvatar(doc.avatar_doctor)} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                            <div className="overflow-hidden">
                              <p className="font-bold text-gray-900 text-sm truncate">Dr. {doc.firstname} {doc.lastname}</p>
                              <p className="text-xs text-blue-600 font-semibold truncate">{doc.specialite}</p>
                            </div>
                          </div>
                          <Link 
                            to={`/doctor/${doc.id}`}
                            className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 px-3 rounded-xl shrink-0"
                          >
                            Book Profile
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* VIEW 2: APPOINTMENTS PANEL */}
            {activeTab === "appointments" && (
              <div className="space-y-8 text-left">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Consultation Bookings</h2>
                    <p className="text-xs text-gray-400">View upcoming scheduled slots and diagnostic history logs.</p>
                  </div>
                  <Link 
                    to="/recherche" 
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-xl shadow-sm"
                  >
                    + Book New Slot
                  </Link>
                </div>

                {/* Reschedule Module Overlay */}
                {reschedulingId && (
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                        <ArrowPathIcon className="w-5 h-5 text-blue-600" />
                        Reschedule Appointment Slot
                      </h4>
                      <button 
                        onClick={() => {
                          setReschedulingId(null);
                          setRescheduleDate("");
                          setRescheduleTime("");
                        }}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-500"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleRescheduleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Date</label>
                        <input
                          type="date"
                          required
                          value={rescheduleDate}
                          onChange={(e) => {
                            setRescheduleDate(e.target.value);
                            setRescheduleTime("");
                          }}
                          className="w-full bg-white border border-gray-300 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Time Slot</label>
                        <select
                          required
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          disabled={!rescheduleDate}
                          className="w-full bg-white border border-gray-300 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition disabled:opacity-50"
                        >
                          <option value="">Choose Slot</option>
                          {availableHours.map((slot) => {
                            const isBooked = rescheduleReservedSlots.includes(slot);
                            return (
                              <option key={slot} value={slot} disabled={isBooked}>
                                {slot} {isBooked ? "(Booked)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <button className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm">
                        Confirm Reschedule
                      </button>
                    </form>
                  </div>
                )}

                {/* Upcoming Bookings */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2">Upcoming Consultations</h3>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No upcoming consultations listed.</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appt) => (
                        <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {appt.doctor && (
                              <img src={getDoctorAvatar(appt.doctor.avatar_doctor)} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {appt.doctor ? `Dr. ${appt.doctor.firstname} ${appt.doctor.lastname}` : "Clinic Doctor"}
                              </p>
                              <p className="text-xs text-blue-600 font-semibold">{appt.doctor?.specialite || "Specialist"}</p>
                              <p className="text-xs text-gray-400 mt-1">Date: <strong className="text-gray-700">{appt.date_appointment}</strong> at <strong className="text-gray-700">{appt.time_appointment}</strong></p>
                              <p className="text-xs text-gray-400">Type: <span className="capitalize">{appt.type_appointment}</span></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setReschedulingId(appt.id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 py-2 px-4 rounded-xl border border-blue-100"
                            >
                              Reschedule
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(appt.id)}
                              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 py-2 px-4 rounded-xl border border-red-100"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past Bookings & Leave Reviews */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2">Past Consultations & Cancellation History</h3>
                  {pastAppointments.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No history consultation logs found.</p>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.map((appt) => {
                        const isCancelled = appt.cancel_appointment === "1";
                        return (
                          <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-75">
                            <div className="flex items-center gap-4">
                              {appt.doctor && (
                                <img src={getDoctorAvatar(appt.doctor.avatar_doctor)} alt="" className="w-12 h-12 rounded-lg object-cover opacity-60" />
                              )}
                              <div>
                                <p className="font-bold text-gray-800 text-sm">
                                  {appt.doctor ? `Dr. ${appt.doctor.firstname} ${appt.doctor.lastname}` : "Clinic Doctor"}
                                </p>
                                <p className="text-xs text-gray-400">{appt.doctor?.specialite || "Specialist"}</p>
                                <p className="text-xs text-gray-400 mt-1">Date: {appt.date_appointment} at {appt.time_appointment}</p>
                              </div>
                            </div>
                            <div>
                              {isCancelled ? (
                                <span className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-100">
                                  Cancelled
                                </span>
                              ) : (
                                <div className="space-y-2">
                                  <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-100 block text-center">
                                    Completed
                                  </span>
                                  <button 
                                    onClick={() => {
                                      setReviewingAppointment(appt.id);
                                      setReviewRating(5);
                                      setReviewComment("");
                                    }}
                                    className="text-xs font-bold text-blue-600 hover:underline block text-center w-full"
                                  >
                                    Leave Review
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Leave Review Overlay Modal */}
                {reviewingAppointment && (
                  <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReviewingAppointment(null)}></div>
                    <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md relative z-10 text-left space-y-4 border border-gray-100">
                      <h4 className="font-bold text-gray-900 text-lg">Leave a Consultation Review</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Share your consultation experience with Dr. {appointments.find(a => a.id === reviewingAppointment)?.doctor?.lastname} to help other patients.</p>
                      
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className="outline-none"
                              >
                                <StarIcon className={`w-8 h-8 ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-200'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Comments</label>
                          <textarea
                            required
                            rows="4"
                            placeholder="Write your review comments here..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition"
                          />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setReviewingAppointment(null)}
                            className="py-2 px-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="py-2 px-5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md"
                          >
                            Submit Review
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* VIEW 3: MEDICAL HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-6 text-left">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-xl font-bold text-gray-900">Medical History Files</h2>
                  <p className="text-xs text-gray-400">Secure access to prescriptions, lab tests, and imaging diagnostics.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Blood Lab Report - June 2026.pdf", type: "Diagnostic Lab", size: "1.2 MB", date: "2026-06-20" },
                    { name: "Prescription Allergy Treatment.pdf", type: "Medical Prescription", size: "340 KB", date: "2026-07-02" },
                    { name: "Chest X-Ray Imaging Analysis.pdf", type: "X-Ray Report", size: "4.5 MB", date: "2026-07-10" }
                  ].map((file, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <ClipboardDocumentListIcon className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{file.name}</p>
                          <p className="text-xs text-gray-400">{file.type} • {file.size} • Uploaded {file.date}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Downloading file: ${file.name}`)}
                        className="p-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Download file"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 4: MESSAGES */}
            {activeTab === "messages" && (
              <div className="space-y-6 text-left">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-xl font-bold text-gray-900">Practitioner Messenger</h2>
                  <p className="text-xs text-gray-400">Simulate direct secure consult chat channels with clinic coordinators.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px]">
                  
                  {/* Chat Header */}
                  <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      D
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Dr. Sarah Jenkins (General Care)</p>
                      <p className="text-[10px] text-green-500 font-semibold">Active Consultation Support</p>
                    </div>
                  </div>

                  {/* Chat Body messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                          msg.sender === 'patient' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                          <span className={`text-[9px] block text-right mt-1 ${msg.sender === 'patient' ? 'text-blue-200' : 'text-gray-400'}`}>
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
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </form>

                </div>
              </div>
            )}

            {/* VIEW 5: MY REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-6 text-left">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-xl font-bold text-gray-900">Reviews & Vitals Summary</h2>
                  <p className="text-xs text-gray-400">History of practitioner feedback ratings left by your account.</p>
                </div>

                <div className="space-y-4">
                  {reviewsList.map((rev, index) => {
                    const docName = rev.doctorName || (rev.doctor ? `Dr. ${rev.doctor.firstname} ${rev.doctor.lastname}` : "Doctor");
                    const spec = rev.specialty || (rev.doctor ? rev.doctor.specialite : "Specialist");
                    const revDate = rev.date || (rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "");
                    return (
                      <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{docName}</p>
                            <p className="text-xs text-blue-600 font-semibold">{spec}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400 block">{revDate}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              rev.status === "approved" ? "bg-green-50 text-green-700 border-green-100" :
                              rev.status === "rejected" ? "bg-red-50 text-red-700 border-red-100" :
                              "bg-yellow-50 text-yellow-700 border-yellow-100"
                            }`}>
                              {rev.status || "Pending"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex text-yellow-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <StarIcon key={i} className="w-4.5 h-4.5" />
                          ))}
                        </div>

                        <p className="text-sm text-gray-600 italic">"{rev.comment}"</p>
                        {rev.reply && (
                          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-1">
                            <p className="text-xs font-bold text-purple-800">Doctor's Reply:</p>
                            <p className="text-xs text-purple-700 italic">"{rev.reply}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 6: SETTINGS (EDIT PROFILE & PASSWORD CHANGE) */}
            {activeTab === "settings" && (
              <div className="space-y-8 text-left">
                
                {/* Profile Edit Form */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="border-b border-gray-50 pb-3">
                    <h3 className="text-lg font-bold text-gray-900">Update Profile Details</h3>
                    <p className="text-xs text-gray-400 font-medium">Keep your patient record bio and contacts accurate.</p>
                  </div>

                  {profileSuccess && (
                    <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg border border-green-100 text-center font-medium flex items-center justify-center gap-1.5">
                      <CheckCircleIcon className="w-5 h-5 shrink-0" />
                      {profileSuccess}
                    </div>
                  )}
                  {profileError && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 text-center font-medium flex items-center justify-center gap-1.5">
                      <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                      {profileError}
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CIN (National Card ID)</label>
                      <input 
                        type="text" 
                        required
                        value={profileForm.cin}
                        onChange={(e) => setProfileForm({ ...profileForm, cin: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="text" 
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="md:col-span-2 pt-2 text-right">
                      <button className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition text-sm shadow-sm">
                        Save Profile Details
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password Update Form */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="border-b border-gray-50 pb-3">
                    <h3 className="text-lg font-bold text-gray-900">Change Account Password</h3>
                    <p className="text-xs text-gray-400 font-medium">Reset your current password to secure your login.</p>
                  </div>

                  {passwordSuccess && (
                    <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg border border-green-100 text-center font-medium flex items-center justify-center gap-1.5">
                      <CheckCircleIcon className="w-5 h-5 shrink-0" />
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 text-center font-medium flex items-center justify-center gap-1.5">
                      <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordUpdateSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="•••••••••"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="•••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="•••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="text-right pt-2">
                      <button className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition text-sm shadow-sm">
                        Reset Password
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;
