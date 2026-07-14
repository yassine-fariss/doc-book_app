import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import axiosClient from "../../AxiosClient";
import { logout as userLogout } from "../../Redux/SliceAuthUser";
import { logout as doctorLogout } from "../../Redux/SliceAuthDoctor";
import { logout as adminLogout } from "../../Redux/SliceAuthAdmin";
import { useToast } from "../../Context/ToastContext";
import { 
  MagnifyingGlassIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  BellIcon
} from "@heroicons/react/24/outline";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Language selector state
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  // User profile dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  // Search dropdown state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Fake Dark Mode state for premium UX
  const [darkMode, setDarkMode] = useState(false);

  const langRef = useRef(null);
  const userRef = useRef(null);

  // Authentication states
  const adminData = useSelector((state) => state.AuthAdmin);
  const doctorData = useSelector((state) => state.AuthDoctor);
  const userData = useSelector((state) => state.authUser);

  const isAdmin = (adminData.isAuthenticated && adminData.adminToken) || adminData.admin;
  const isDoctor = (doctorData.isAuthenticated && doctorData.doctorToken) || doctorData.doctor;
  const isPatient = (userData.isAuthenticated && userData.userToken) || userData.user;
  const isAuthenticated = isAdmin || isDoctor || isPatient;

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set default language list
  const locales = {
    en: "English",
    fr: "Français",
    cn: "中文"
  };

  const handleLogout = () => {
    let logoutUrl = "/user/logout";
    if (isAdmin) {
      triggerLocalLogout(); // Admin lacks a backend logout route
      return;
    } else if (isDoctor) {
      logoutUrl = "/doctor/logout";
    }

    axiosClient
      .post(logoutUrl)
      .then(() => {
        triggerLocalLogout();
      })
      .catch((err) => {
        console.error(err);
        triggerLocalLogout();
      });
  };

  const triggerLocalLogout = () => {
    if (isAdmin) dispatch(adminLogout());
    if (isDoctor) dispatch(doctorLogout());
    if (isPatient) dispatch(userLogout());
    showToast("Logged out successfully.", "success");
    setUserDropdownOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?name=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Get user details based on role
  const getUserDetails = () => {
    if (isAdmin) {
      return {
        name: "Administrator",
        email: "admin@example.com",
        role: "System Admin",
        link: "/admin/dashboard"
      };
    }
    if (isDoctor) {
      const doc = doctorData.doctor || {};
      return {
        name: `Dr. ${doc.firstname || ""} ${doc.lastname || ""}`,
        email: doc.email || "doctor@example.com",
        role: "Healthcare Professional",
        link: "/doctor/dashboard"
      };
    }
    if (isPatient) {
      const pat = userData.user || {};
      return {
        name: `${pat.firstname || ""} ${pat.lastname || ""}`,
        email: pat.email || "patient@example.com",
        role: "Patient Account",
        link: "/user/profile"
      };
    }
    return null;
  };

  const userDetails = getUserDetails();

  const navigationLinks = [
    { name: t("Header.Home"), path: "/" },
    { name: t("Header.Find_Doctor"), path: "/recherche" },
    { name: t("Header.About"), path: "/about" },
    { name: t("Header.Contact"), path: "/contact" },
    { name: "FAQ", path: "/faq" }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 ${
          isScrolled 
            ? "shadow-md py-3" 
            : "shadow-sm py-4 md:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group transition flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition duration-200">
              {/* Heartbeat Pulse SVG Icon */}
              <svg className="w-5.5 h-5.5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h1.5l2.25-4.5L11.25 18l3-10.5 2.25 4.5h1.5" />
              </svg>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Health<span className="text-blue-600 font-extrabold">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navigationLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                    isActive 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Elegant Expanding Search Bar */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctor name..."
                    className="bg-transparent text-xs text-gray-700 outline-none w-44"
                    autoFocus
                  />
                  <button type="submit" className="text-gray-400 hover:text-blue-600 transition">
                    <MagnifyingGlassIcon className="w-4.5 h-4.5" />
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-red-500 ml-1.5 transition">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full transition"
                  title="Search doctor"
                >
                  <MagnifyingGlassIcon className="w-5.5 h-5.5" />
                </button>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 p-2.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full transition uppercase text-xs font-bold"
              >
                <GlobeAltIcon className="w-5.5 h-5.5" />
                <span>{i18n.resolvedLanguage}</span>
                <ChevronDownIcon className="w-3.5 h-3.5" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50 animate-fade-in">
                  {Object.keys(locales).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        i18n.changeLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center justify-between ${
                        i18n.resolvedLanguage === lang ? "text-blue-600 font-semibold" : "text-gray-600"
                      }`}
                    >
                      <span>{locales[lang]}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">{lang}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode toggle (Premium UI accessory) */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full transition"
            >
              {darkMode ? <SunIcon className="w-5.5 h-5.5 text-yellow-500" /> : <MoonIcon className="w-5.5 h-5.5" />}
            </button>

            {/* Notifications Bell */}
            <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full transition relative">
              <BellIcon className="w-5.5 h-5.5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Divider */}
            <span className="w-px h-6 bg-gray-200 block mx-1"></span>

            {/* Authentication Portal buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 group transition"
                >
                  <img
                    className="w-10 h-10 rounded-full border border-gray-200 p-0.5 object-cover group-hover:border-blue-500 transition duration-200 shadow-sm"
                    src="/img/Rectangle 9.png"
                    alt="User avatar"
                  />
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl py-3 z-50 animate-fade-in text-left">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{userDetails.name}</p>
                      <p className="text-xs text-gray-400 truncate">{userDetails.email}</p>
                      <span className="inline-block bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1">
                        {userDetails.role}
                      </span>
                    </div>

                    <Link 
                      to={isPatient ? "/user/profile?tab=dashboard" : userDetails.link} 
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <UserCircleIcon className="w-5 h-5 text-gray-400" />
                      Dashboard Portal
                    </Link>

                    <Link 
                      to={isPatient ? "/user/profile?tab=appointments" : userDetails.link}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      Appointments
                    </Link>

                    <Link 
                      to={isPatient ? "/user/profile?tab=settings" : userDetails.link}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <CogIcon className="w-5 h-5 text-gray-400" />
                      Account Settings
                    </Link>

                    <hr className="my-2 border-gray-50" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-bold"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/Connexion" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition px-3 py-2">
                  Sign In
                </Link>
                <Link 
                  to="/recherche" 
                  className="bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/10 active:scale-[0.98] transition-all duration-200"
                >
                  Book Appointment
                </Link>
              </div>
            )}

          </div>

          {/* Hamburger Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-blue-600 transition"
            >
              <Bars3Icon className="w-7 h-7" />
            </button>
          </div>

        </div>
      </header>

      {/* Fullscreen Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-lg flex flex-col justify-between p-6 animate-fade-in md:hidden text-left">
          
          <div>
            {/* Header close actions inside mobile drawer */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h1.5l2.25-4.5L11.25 18l3-10.5 2.25 4.5h1.5" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">HealthConnect</span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-red-500 transition"
              >
                <XMarkIcon className="w-7 h-7" />
              </button>
            </div>

            {/* Mobile Nav list */}
            <nav className="flex flex-col gap-3 pt-8">
              {navigationLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-lg font-bold rounded-xl transition ${
                      isActive 
                        ? "text-blue-600 bg-blue-50/50" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Drawer Footer actions */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            
            {/* Language switcher selector on mobile drawer */}
            <div className="flex items-center justify-around bg-gray-50 rounded-2xl py-2">
              {Object.keys(locales).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    i18n.changeLanguage(lang);
                  }}
                  className={`text-xs font-extrabold uppercase px-4 py-2 rounded-xl transition ${
                    i18n.resolvedLanguage === lang ? "text-blue-600 bg-white shadow-sm" : "text-gray-400"
                  }`}
                >
                  {locales[lang]} ({lang})
                </button>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="space-y-3">
                <Link
                  to={isPatient ? "/user/profile?tab=dashboard" : userDetails.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-blue-50 text-blue-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-100 transition"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  My Dashboard Portal
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/Connexion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/recherche"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/10 transition"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </>
  );
};

export default Header;
