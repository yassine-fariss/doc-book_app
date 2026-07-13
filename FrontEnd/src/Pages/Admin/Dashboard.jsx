import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NavBarAdmin } from "../../Components";
import axiosClient from "../../AxiosClient";
import { logout } from "../../Redux/SliceAuthAdmin";
import { remove } from "../../Services/LocalStorageService";
import GetAuthAdmin from "../../hooks/GetAuthAdmin";
import { useToast } from "../../Context/ToastContext.jsx";
import {
  UserIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  XCircleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/20/solid";

const Dashboard = () => {
  document.title = "Admin Dashboard - DocAppoint";
  useSelector((state) => state.AuthAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  GetAuthAdmin();

  // Active Tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [, setLoading] = useState(true);

  // Search states
  const [doctorSearch, setDoctorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [appointmentSearch, setAppointmentSearch] = useState("");

  // Filter states
  const [doctorFilter, setDoctorFilter] = useState("all"); // all, verified, unverified, suspended

  // Action feedback
  const [actionSuccess, setActionSuccess] = useState("");

  // Selected patient detail modal
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    siteName: "DocAppoint",
    contactEmail: "admin@docappoint.com",
    maintenanceMode: false,
    allowRegistrations: true,
    defaultCurrency: "MAD",
    appointmentDuration: "30",
  });
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Reviews state (fetched from backend)
  const [reviews, setReviews] = useState([]);

  // Mock payments
  const [payments] = useState([
    { id: "PAY-001", patientName: "Karim Benjelloun", doctorName: "Dr. Amani Hassan", amount: 350, date: "2026-07-12", method: "Card", status: "completed" },
    { id: "PAY-002", patientName: "Clara Martin", doctorName: "Dr. Youssef El Idrissi", amount: 200, date: "2026-07-11", method: "Cash", status: "completed" },
    { id: "PAY-003", patientName: "Omar Tazi", doctorName: "Dr. Fatima Zahra", amount: 450, date: "2026-07-10", method: "Card", status: "refunded" },
    { id: "PAY-004", patientName: "Sarah Bennis", doctorName: "Dr. Khalid Rachid", amount: 300, date: "2026-07-09", method: "Card", status: "completed" },
    { id: "PAY-005", patientName: "Ahmed Larbi", doctorName: "Dr. Amani Hassan", amount: 350, date: "2026-07-08", method: "Transfer", status: "pending" },
    { id: "PAY-006", patientName: "Layla Fassi", doctorName: "Dr. Youssef El Idrissi", amount: 200, date: "2026-07-07", method: "Cash", status: "completed" },
  ]);

  const fetchAllData = useCallback(() => {
    setLoading(true);

    axiosClient.get("/admin/doctor")
      .then((res) => setDoctors(res.data || []))
      .catch((err) => console.error("Error fetching doctors:", err));

    axiosClient.get("/admin/patient")
      .then((res) => setPatients(res.data || []))
      .catch((err) => console.error("Error fetching patients:", err));

    axiosClient.get("/admin/appointments")
      .then((res) => setAppointments(res.data || []))
      .catch((err) => console.error("Error fetching appointments:", err));

    axiosClient.get("/admin/stats")
      .then((res) => setStats(res.data || {}))
      .catch((err) => console.error("Error fetching stats:", err));

    axiosClient.get("/admin/reviews")
      .then((res) => setReviews(res.data || []))
      .catch((err) => console.error("Error fetching reviews:", err));

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleLogout = () => {
    axiosClient
      .post("/user/logout")
      .then((res) => {
        if (res.status === 200) {
          dispatch(logout());
          remove("TOKEN_ADMIN");
          navigate("/admin/login");
        }
      })
      .catch((err) => console.error("Logout failed:", err));
  };

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    showToast(msg, "success");
    setTimeout(() => setActionSuccess(""), 4000);
  };

  // Doctor Actions
  const handleVerifyDoctor = (id) => {
    axiosClient.post("/admin/verified", { id })
      .then((res) => {
        setDoctors(res.data || []);
        showSuccess("Doctor verified successfully!");
      })
      .catch((err) => console.error(err));
  };

  const handleSuspendDoctor = (id) => {
    axiosClient.post(`/admin/doctor/suspend/${id}`)
      .then((res) => {
        if (res.data.success) {
          setDoctors(doctors.map(d => d.id === id ? { ...d, available: res.data.doctor.available } : d));
          showSuccess("Doctor availability status updated!");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteDoctor = (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this doctor and all their appointments?")) return;
    axiosClient.delete(`/admin/doctor/delete/${id}`)
      .then((res) => {
        if (res.data.success) {
          setDoctors(doctors.filter(d => d.id !== id));
          showSuccess("Doctor deleted successfully!");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleCancelAppointment = (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    axiosClient.post(`/appointment/cancel/${id}`)
      .then((res) => {
        if (res.data.success) {
          setAppointments(appointments.map(a => a.id === id ? { ...a, cancel_appointment: "1" } : a));
          showSuccess("Appointment cancelled!");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleUpdateReviewStatus = (reviewId, status) => {
    axiosClient.post("/admin/reviews/status", {
      review_id: reviewId,
      status: status
    })
    .then((res) => {
      if (res.data.success) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: status } : r));
        showSuccess(`Review status updated to ${status}!`);
      }
    })
    .catch((err) => console.error("Error updating review status:", err));
  };

  const handleDeleteReview = (reviewId) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
    axiosClient.delete(`/admin/reviews/${reviewId}`)
    .then((res) => {
      if (res.data.success) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        showSuccess("Review deleted successfully!");
      }
    })
    .catch((err) => console.error("Error deleting review:", err));
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    setSettingsSuccess("Platform settings saved successfully!");
    showToast("Platform settings saved successfully!", "success");
    setTimeout(() => setSettingsSuccess(""), 4000);
  };

  // Filtered data
  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = `${d.firstname} ${d.lastname} ${d.specialite} ${d.email}`.toLowerCase().includes(doctorSearch.toLowerCase());
    if (doctorFilter === "verified") return matchesSearch && d.verified;
    if (doctorFilter === "unverified") return matchesSearch && !d.verified;
    if (doctorFilter === "suspended") return matchesSearch && !d.available;
    return matchesSearch;
  });

  const filteredPatients = patients.filter(p =>
    `${p.firstname} ${p.lastname} ${p.email} ${p.cin}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredAppointments = appointments.filter(a => {
    const patientName = a.user ? `${a.user.firstname} ${a.user.lastname}` : "";
    const doctorName = a.doctor ? `${a.doctor.firstname} ${a.doctor.lastname}` : "";
    return `${patientName} ${doctorName} ${a.date_appointment} ${a.type_appointment}`.toLowerCase().includes(appointmentSearch.toLowerCase());
  });

  // Stats computations
  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: ChartBarIcon },
    { id: "doctors", label: "Doctors", icon: UserIcon },
    { id: "patients", label: "Patients", icon: UserGroupIcon },
    { id: "appointments", label: "Appointments", icon: CalendarDaysIcon },
    { id: "reviews", label: "Reviews", icon: StarIcon },
    { id: "payments", label: "Payments", icon: CurrencyDollarIcon },
    { id: "reports", label: "Reports", icon: BuildingOffice2Icon },
    { id: "settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  return (
    <>
      <NavBarAdmin />

      <div className="flex pt-16 overflow-hidden bg-gray-50/50 min-h-screen">

        {/* Sidebar */}
        <aside className="fixed top-16 left-0 z-20 flex-col flex-shrink-0 w-64 h-full pt-1 pb-4 transition-width duration-75 hidden lg:flex bg-white border-r border-gray-200">
          <div className="flex flex-col flex-1 min-h-0 pt-4 overflow-y-auto">
            <div className="flex-1 px-4 space-y-1 bg-white">

              {/* Admin Badge */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 mb-6 text-left">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  A
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-gray-800 text-sm truncate">Admin Panel</h4>
                  <p className="text-[10px] text-purple-600 font-semibold truncate">System Administrator</p>
                </div>
              </div>

              <nav className="flex flex-col gap-1 text-left">
                {sidebarItems.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3 w-full py-3 px-4 text-sm font-semibold rounded-xl transition ${
                        activeTab === item.id
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
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

        {/* Main Content */}
        <div className="relative w-full h-full overflow-y-auto bg-gray-50/20 ml-0 lg:ml-64 p-4 md:p-8 text-left">
          
          {/* Mobile Panel Selector */}
          <div className="lg:hidden mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Select Panel</label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition font-semibold cursor-pointer"
            >
              <option value="dashboard">Dashboard Overview</option>
              <option value="doctors">Doctors</option>
              <option value="patients">Patients</option>
              <option value="appointments">Appointments</option>
              <option value="reviews">Reviews</option>
              <option value="payments">Payments</option>
              <option value="reports">Reports</option>
              <option value="settings">Settings</option>
            </select>
          </div>

          {actionSuccess && (
            <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl border border-green-100 mb-6 text-center font-semibold flex items-center justify-center gap-1.5">
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
              {actionSuccess}
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 1: DASHBOARD OVERVIEW                       */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">

              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
                <div className="relative z-10 space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold">Admin Control Center</h2>
                  <p className="text-purple-100 text-sm max-w-lg">Monitor platform activity, manage doctors and patients, review appointments, and configure system settings.</p>
                </div>
                <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none">
                  <ShieldCheckIcon className="w-40 h-40" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Doctors</p>
                  <p className="text-3xl font-extrabold text-purple-600 mt-2">{stats.totalDoctors || doctors.length}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{stats.verifiedDoctors || 0} verified • {stats.unverifiedDoctors || 0} pending</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Patients</p>
                  <p className="text-3xl font-extrabold text-blue-600 mt-2">{stats.totalPatients || patients.length}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Registered users</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Appointments</p>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.totalAppointments || appointments.length}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{stats.cancelledAppointments || 0} cancelled</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-extrabold text-amber-600 mt-2">{totalRevenue.toLocaleString()} MAD</p>
                  <p className="text-[10px] text-gray-400 mt-1">From {payments.filter(p => p.status === "completed").length} transactions</p>
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 px-1">Recent Appointments</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 text-left">Patient</th>
                          <th className="px-6 py-4 text-left">Doctor</th>
                          <th className="px-6 py-4 text-left">Date</th>
                          <th className="px-6 py-4 text-left">Time</th>
                          <th className="px-6 py-4 text-left">Type</th>
                          <th className="px-6 py-4 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {appointments.slice(0, 5).map((appt) => (
                          <tr key={appt.id}>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold">
                              {appt.user ? `${appt.user.firstname} ${appt.user.lastname}` : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {appt.doctor ? `Dr. ${appt.doctor.lastname}` : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{appt.date_appointment}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-purple-600">{appt.time_appointment}</td>
                            <td className="px-6 py-4 whitespace-nowrap capitalize">{appt.type_appointment}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                appt.cancel_appointment === "1"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-green-50 text-green-700"
                              }`}>
                                {appt.cancel_appointment === "1" ? "Cancelled" : "Active"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {appointments.length === 0 && (
                          <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No appointments found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => setActiveTab("doctors")} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-left group">
                  <UserIcon className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-gray-900 text-sm">Manage Doctors</h4>
                  <p className="text-xs text-gray-400 mt-1">Approve, suspend, or remove doctor accounts</p>
                </button>
                <button onClick={() => setActiveTab("patients")} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-left group">
                  <UserGroupIcon className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-gray-900 text-sm">View Patients</h4>
                  <p className="text-xs text-gray-400 mt-1">Browse patient records and account details</p>
                </button>
                <button onClick={() => setActiveTab("appointments")} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-left group">
                  <CalendarDaysIcon className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-gray-900 text-sm">All Appointments</h4>
                  <p className="text-xs text-gray-400 mt-1">View and manage platform-wide appointments</p>
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 2: DOCTORS MANAGEMENT                       */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === "doctors" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Doctors Management</h2>
                <p className="text-xs text-gray-400">Approve, suspend, and manage all registered doctors.</p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, specialty, or email..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "verified", "unverified", "suspended"].map(f => (
                    <button
                      key={f}
                      onClick={() => setDoctorFilter(f)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition capitalize ${
                        doctorFilter === f
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctors Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-left">Doctor</th>
                        <th className="px-6 py-4 text-left">Specialty</th>
                        <th className="px-6 py-4 text-left">Email</th>
                        <th className="px-6 py-4 text-left">Phone</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {filteredDoctors.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xs border border-purple-100">
                                {doc.firstname ? doc.firstname.charAt(0) : "D"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">Dr. {doc.firstname} {doc.lastname}</p>
                                <p className="text-[10px] text-gray-400">ID: #{doc.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-purple-600 font-semibold text-xs">{doc.specialite || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{doc.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{doc.phoneNumber || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {doc.verified ? (
                                <span className="bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-green-100 w-fit">Verified</span>
                              ) : (
                                <span className="bg-yellow-50 text-yellow-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-yellow-100 w-fit">Pending</span>
                              )}
                              {!doc.available && (
                                <span className="bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-100 w-fit">Suspended</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!doc.verified && (
                                <button
                                  onClick={() => handleVerifyDoctor(doc.id)}
                                  className="text-[10px] font-bold text-green-600 hover:text-green-700 bg-green-50 py-1.5 px-3 rounded-lg border border-green-100 transition"
                                  title="Approve"
                                >
                                  <CheckCircleIcon className="w-3.5 h-3.5 inline mr-1" />
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => handleSuspendDoctor(doc.id)}
                                className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition ${
                                  doc.available
                                    ? "text-amber-600 hover:text-amber-700 bg-amber-50 border-amber-100"
                                    : "text-blue-600 hover:text-blue-700 bg-blue-50 border-blue-100"
                                }`}
                                title={doc.available ? "Suspend" : "Reactivate"}
                              >
                                <XCircleIcon className="w-3.5 h-3.5 inline mr-1" />
                                {doc.available ? "Suspend" : "Activate"}
                              </button>
                              <button
                                onClick={() => handleDeleteDoctor(doc.id)}
                                className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100 transition"
                                title="Delete"
                              >
                                <TrashIcon className="w-3.5 h-3.5 inline mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredDoctors.length === 0 && (
                        <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400 text-sm">No doctors match your search criteria.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-right">Showing {filteredDoctors.length} of {doctors.length} doctors</p>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 3: PATIENTS MANAGEMENT                      */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === "patients" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Patients Directory</h2>
                <p className="text-xs text-gray-400">View and manage all registered patient accounts.</p>
              </div>

              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or CIN..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-left">Patient</th>
                        <th className="px-6 py-4 text-left">Email</th>
                        <th className="px-6 py-4 text-left">CIN</th>
                        <th className="px-6 py-4 text-left">Phone</th>
                        <th className="px-6 py-4 text-left">Registered</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {filteredPatients.map((pat) => (
                        <tr key={pat.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs border border-blue-100">
                                {pat.firstname ? pat.firstname.charAt(0) : "P"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{pat.firstname} {pat.lastname}</p>
                                <p className="text-[10px] text-gray-400">ID: #{pat.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{pat.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs font-semibold">{pat.cin || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{pat.phoneNumber || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">{pat.created_at ? new Date(pat.created_at).toLocaleDateString() : "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedPatient(pat)}
                              className="text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 py-1.5 px-3 rounded-lg border border-purple-100 transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredPatients.length === 0 && (
                        <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400 text-sm">No patients match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-right">Showing {filteredPatients.length} of {patients.length} patients</p>

              {/* Patient Detail Modal */}
              {selectedPatient && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedPatient(null)}></div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md relative z-10 space-y-4 border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-50 pb-3">Patient Profile</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Full Name</span>
                        <strong className="text-gray-800 text-base">{selectedPatient.firstname} {selectedPatient.lastname}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">CIN</span>
                        <span className="text-gray-800 font-semibold">{selectedPatient.cin || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Email</span>
                        <span className="text-gray-800 font-semibold">{selectedPatient.email}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Phone</span>
                        <span className="text-gray-800 font-semibold">{selectedPatient.phoneNumber || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Registration Date</span>
                        <span className="text-gray-800 font-semibold">{selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                    <div className="text-right pt-2 border-t border-gray-50">
                      <button onClick={() => setSelectedPatient(null)} className="py-2 px-5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition shadow-md">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 4: APPOINTMENTS                             */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Appointments Management</h2>
                <p className="text-xs text-gray-400">View and manage all platform appointments.</p>
              </div>

              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient, doctor, date, or type..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-left">Patient</th>
                        <th className="px-6 py-4 text-left">Doctor</th>
                        <th className="px-6 py-4 text-left">Date</th>
                        <th className="px-6 py-4 text-left">Time</th>
                        <th className="px-6 py-4 text-left">Type</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {filteredAppointments.map((appt) => {
                        const isCancelled = appt.cancel_appointment === "1";
                        return (
                          <tr key={appt.id} className={`hover:bg-gray-50/50 transition ${isCancelled ? "opacity-60" : ""}`}>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold">
                              {appt.user ? `${appt.user.firstname} ${appt.user.lastname}` : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {appt.doctor ? `Dr. ${appt.doctor.firstname} ${appt.doctor.lastname}` : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{appt.date_appointment}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-purple-600">{appt.time_appointment}</td>
                            <td className="px-6 py-4 whitespace-nowrap capitalize text-xs">{appt.type_appointment}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isCancelled ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                              }`}>
                                {isCancelled ? "Cancelled" : "Active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {!isCancelled && (
                                <button
                                  onClick={() => handleCancelAppointment(appt.id)}
                                  className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100 transition"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredAppointments.length === 0 && (
                        <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400 text-sm">No appointments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-right">Showing {filteredAppointments.length} of {appointments.length} appointments</p>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 5: REVIEWS                                  */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Patient Reviews</h2>
                <p className="text-xs text-gray-400">Monitor and manage patient feedback across the platform.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-purple-600">{reviews.length}</p>
                  <p className="text-xs text-gray-400 font-bold">Total Reviews</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-amber-500">
                    {reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                  </p>
                  <p className="text-xs text-gray-400 font-bold">Average Rating</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-emerald-600">{reviews.filter(r => r.status === "approved").length}</p>
                  <p className="text-xs text-gray-400 font-bold">Approved</p>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => {
                  const patientName = rev.user ? `${rev.user.firstname} ${rev.user.lastname}` : (rev.patientName || "Patient");
                  const doctorName = rev.doctor ? `Dr. ${rev.doctor.firstname} ${rev.doctor.lastname}` : (rev.doctorName || "Doctor");
                  const revDate = rev.created_at ? new Date(rev.created_at).toLocaleDateString() : (rev.date || "");
                  return (
                    <div key={rev.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{patientName}</p>
                          <p className="text-xs text-purple-600 font-semibold">→ {doctorName}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            rev.status === "approved" ? "bg-green-50 text-green-700 border border-green-100" :
                            rev.status === "rejected" ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          }`}>
                            {rev.status === "approved" ? "Approved" : rev.status === "rejected" ? "Rejected" : "Pending Review"}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">{revDate}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`w-4 h-4 ${i < rev.rating ? "text-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 italic">"{rev.comment}"</p>
                      
                      {rev.reply && (
                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-1">
                          <p className="text-xs font-bold text-purple-800">Doctor's Reply:</p>
                          <p className="text-xs text-purple-700 italic">"{rev.reply}"</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 justify-end">
                        {rev.status !== "approved" && (
                          <button
                            onClick={() => handleUpdateReviewStatus(rev.id, "approved")}
                            className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-100 transition"
                          >
                            Approve
                          </button>
                        )}
                        {rev.status !== "rejected" && (
                          <button
                            onClick={() => handleUpdateReviewStatus(rev.id, "rejected")}
                            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-yellow-100 transition"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
                {reviews.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No patient reviews found.</p>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 6: PAYMENTS                                 */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Payment Records</h2>
                <p className="text-xs text-gray-400">Track consultation payments and revenue across the platform.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-emerald-600">{totalRevenue.toLocaleString()} MAD</p>
                  <p className="text-xs text-gray-400 font-bold">Total Revenue</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-purple-600">{payments.length}</p>
                  <p className="text-xs text-gray-400 font-bold">Transactions</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-amber-500">{payments.filter(p => p.status === "pending").length}</p>
                  <p className="text-xs text-gray-400 font-bold">Pending</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-red-500">{payments.filter(p => p.status === "refunded").length}</p>
                  <p className="text-xs text-gray-400 font-bold">Refunded</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-left">Payment ID</th>
                        <th className="px-6 py-4 text-left">Patient</th>
                        <th className="px-6 py-4 text-left">Doctor</th>
                        <th className="px-6 py-4 text-left">Amount</th>
                        <th className="px-6 py-4 text-left">Method</th>
                        <th className="px-6 py-4 text-left">Date</th>
                        <th className="px-6 py-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-purple-600">{pay.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">{pay.patientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{pay.doctorName}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{pay.amount} MAD</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{pay.method}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{pay.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              pay.status === "completed" ? "bg-green-50 text-green-700" :
                              pay.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                              "bg-red-50 text-red-700"
                            }`}>
                              {pay.status.charAt(0).toUpperCase() + pay.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 7: REPORTS & ANALYTICS                      */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
                <p className="text-xs text-gray-400">Platform performance insights and data summaries.</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-2xl text-white shadow-md">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">Doctors Registered</p>
                  <p className="text-3xl font-extrabold mt-2">{doctors.length}</p>
                  <p className="text-xs opacity-70 mt-1">{doctors.filter(d => d.verified).length} verified</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl text-white shadow-md">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">Patients Registered</p>
                  <p className="text-3xl font-extrabold mt-2">{patients.length}</p>
                  <p className="text-xs opacity-70 mt-1">Active accounts</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl text-white shadow-md">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">Appointments Booked</p>
                  <p className="text-3xl font-extrabold mt-2">{appointments.length}</p>
                  <p className="text-xs opacity-70 mt-1">{appointments.filter(a => a.cancel_appointment !== "1").length} active</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-6 rounded-2xl text-white shadow-md">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">Revenue Generated</p>
                  <p className="text-3xl font-extrabold mt-2">{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs opacity-70 mt-1">MAD from consultations</p>
                </div>
              </div>

              {/* Specialty Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base">Specialty Distribution</h3>
                <div className="space-y-3">
                  {(() => {
                    const specMap = {};
                    doctors.forEach(d => {
                      const spec = d.specialite || "Unspecified";
                      specMap[spec] = (specMap[spec] || 0) + 1;
                    });
                    const entries = Object.entries(specMap).sort((a, b) => b[1] - a[1]);
                    const maxCount = entries.length > 0 ? entries[0][1] : 1;
                    return entries.slice(0, 8).map(([spec, count]) => (
                      <div key={spec} className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-gray-700 w-32 truncate">{spec}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    ));
                  })()}
                  {doctors.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No doctor data available for analysis.</p>
                  )}
                </div>
              </div>

              {/* Appointment Trends */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base">Appointment Trends (by Type)</h3>
                <div className="space-y-3">
                  {(() => {
                    const typeMap = {};
                    appointments.forEach(a => {
                      const type = a.type_appointment || "Unknown";
                      typeMap[type] = (typeMap[type] || 0) + 1;
                    });
                    const entries = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
                    const maxCount = entries.length > 0 ? entries[0][1] : 1;
                    const colors = ["from-emerald-400 to-emerald-600", "from-blue-400 to-blue-600", "from-amber-400 to-amber-600", "from-pink-400 to-pink-600"];
                    return entries.map(([type, count], idx) => (
                      <div key={type} className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-gray-700 w-32 truncate capitalize">{type}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${colors[idx % colors.length]} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    ));
                  })()}
                  {appointments.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No appointment data available for analysis.</p>
                  )}
                </div>
              </div>

              {/* Platform Summary */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-4">Platform Health Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <ClockIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-400 font-bold">Uptime</p>
                    <p className="text-sm font-extrabold text-gray-800">99.9%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <CheckCircleIcon className="w-6 h-6 mx-auto text-green-400 mb-1" />
                    <p className="text-xs text-gray-400 font-bold">API Status</p>
                    <p className="text-sm font-extrabold text-green-600">Healthy</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <UserGroupIcon className="w-6 h-6 mx-auto text-blue-400 mb-1" />
                    <p className="text-xs text-gray-400 font-bold">Active Users</p>
                    <p className="text-sm font-extrabold text-gray-800">{patients.length + doctors.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <CalendarDaysIcon className="w-6 h-6 mx-auto text-purple-400 mb-1" />
                    <p className="text-xs text-gray-400 font-bold">Completion Rate</p>
                    <p className="text-sm font-extrabold text-gray-800">
                      {appointments.length > 0 ? `${Math.round((appointments.filter(a => a.cancel_appointment !== "1").length / appointments.length) * 100)}%` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 8: SETTINGS                                 */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900">Platform Settings</h2>
                <p className="text-xs text-gray-400">Configure global platform parameters and preferences.</p>
              </div>

              {settingsSuccess && (
                <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl border border-green-100 text-center font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircleIcon className="w-5 h-5 shrink-0" />
                  {settingsSuccess}
                </div>
              )}

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <form onSubmit={handleSettingsSave} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Platform Name</label>
                      <input
                        type="text"
                        value={settingsForm.siteName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-xl p-3 outline-none focus:border-purple-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Contact Email</label>
                      <input
                        type="email"
                        value={settingsForm.contactEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-xl p-3 outline-none focus:border-purple-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Default Currency</label>
                      <select
                        value={settingsForm.defaultCurrency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultCurrency: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-xl p-3 outline-none focus:border-purple-500 transition"
                      >
                        <option value="MAD">MAD (Moroccan Dirham)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Default Appointment Duration</label>
                      <select
                        value={settingsForm.appointmentDuration}
                        onChange={(e) => setSettingsForm({ ...settingsForm, appointmentDuration: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-xl p-3 outline-none focus:border-purple-500 transition"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle Settings */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-bold text-gray-800">Maintenance Mode</p>
                        <p className="text-xs text-gray-400">Temporarily disable the platform for maintenance.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settingsForm.maintenanceMode ? "bg-red-500" : "bg-gray-300"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settingsForm.maintenanceMode ? "translate-x-5" : "translate-x-0"
                        }`}></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-bold text-gray-800">Allow New Registrations</p>
                        <p className="text-xs text-gray-400">Enable or disable new patient and doctor registrations.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, allowRegistrations: !settingsForm.allowRegistrations })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settingsForm.allowRegistrations ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settingsForm.allowRegistrations ? "translate-x-5" : "translate-x-0"
                        }`}></span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button className="bg-purple-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-purple-700 transition text-sm shadow-sm">
                      Save Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Dashboard;
