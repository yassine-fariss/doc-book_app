import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Footer,
  Header,
  AlertToRegistre,
  SearchDoctorCard,
  SkeletonCard,
} from "../Components";
import "../Assets/Css/HomeCss/SearchDoctors.css";
import axiosClient from "../AxiosClient";
import { useSelector } from "react-redux";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/20/solid";

const SearchDoctors = () => {
  document.title = "Search Doctors - DocAppoint";

  const AuthUserData = useSelector((state) => state.authUser);
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sidebar Filter States
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterHospital, setFilterHospital] = useState("");
  const [filterExperience, setFilterExperience] = useState("Any");
  const [filterFee, setFilterFee] = useState("Any");
  const [filterGender, setFilterGender] = useState("Any");
  const [filterLanguages, setFilterLanguages] = useState([]);
  const [filterRating, setFilterRating] = useState("Any");
  const [filterAvailability, setFilterAvailability] = useState("Any");

  // Main Content States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("Default");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load all doctors ONCE to populate the filter dropdowns dynamically
  useEffect(() => {
    axiosClient
      .post("/search/doctors", {})
      .then((res) => {
        const docs = res.data.DataSearch || [];
        setAllDoctors(docs);
        
        // Read query parameters (e.g. from homepage redirect)
        const params = new URLSearchParams(location.search);
        if (params.get("specialite")) setFilterSpecialty(params.get("specialite"));
        if (params.get("city")) setFilterCity(params.get("city"));
      })
      .catch((err) => {
        console.error("Error fetching initial doctors list for filters:", err);
      });
  }, [location.search]);

  // Compute filter options dynamically from active dataset
  const specialtiesList = ["All Specialties", ...new Set(allDoctors.map((d) => d.specialite).filter(Boolean))];
  const citiesList = ["All Cities", ...new Set(allDoctors.map((d) => d.address_cabinet).filter(Boolean))];
  const hospitalsList = ["All Hospitals", ...new Set(allDoctors.map((d) => d.nom_cabinet).filter(Boolean))];

  // Fetch filtered doctors from the API whenever filters change
  useEffect(() => {
    setLoading(true);
    axiosClient
      .post("/search/doctors", {
        searchQuery,
        specialite: filterSpecialty,
        city: filterCity,
        hospital: filterHospital,
        experience: filterExperience,
        fee: filterFee,
        gender: filterGender,
        languages: filterLanguages,
        rating: filterRating,
        availability: filterAvailability,
        sortKey: sortKey
      })
      .then((res) => {
        setFilteredDoctors(res.data.DataSearch || []);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setFilteredDoctors([]);
        } else {
          console.error("Error fetching filtered doctors:", err);
        }
        setLoading(false);
      });
  }, [
    searchQuery,
    filterSpecialty,
    filterCity,
    filterHospital,
    filterExperience,
    filterFee,
    filterGender,
    filterLanguages,
    filterRating,
    filterAvailability,
    sortKey
  ]);

  // Pagination bounds
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleLanguageChange = (lang) => {
    if (filterLanguages.includes(lang)) {
      setFilterLanguages(filterLanguages.filter((l) => l !== lang));
    } else {
      setFilterLanguages([...filterLanguages, lang]);
    }
  };

  const resetFilters = () => {
    setFilterSpecialty("");
    setFilterCity("");
    setFilterHospital("");
    setFilterExperience("Any");
    setFilterFee("Any");
    setFilterGender("Any");
    setFilterLanguages([]);
    setFilterRating("Any");
    setFilterAvailability("Any");
    setSearchQuery("");
    setSortKey("Default");
  };

  const [showAlertToRegistre, setSowAlertToRegistre] = useState(
    AuthUserData.showAlertToAuth
  );

  const renderSidebarContent = () => (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
        <button 
          onClick={resetFilters} 
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
        >
          Reset All
        </button>
      </div>

      {/* Specialty */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Specialty</label>
        <select
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
        >
          {specialtiesList.map((spec, i) => (
            <option key={i} value={spec === "All Specialties" ? "" : spec}>{spec}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
        >
          {citiesList.map((city, i) => (
            <option key={i} value={city === "All Cities" ? "" : city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Hospital */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hospital</label>
        <select
          value={filterHospital}
          onChange={(e) => setFilterHospital(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
        >
          {hospitalsList.map((hosp, i) => (
            <option key={i} value={hosp === "All Hospitals" ? "" : hosp}>{hosp}</option>
          ))}
        </select>
      </div>

      {/* Experience */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Experience</label>
        <select
          value={filterExperience}
          onChange={(e) => setFilterExperience(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
        >
          <option value="Any">Any Experience</option>
          <option value="5">5+ Years</option>
          <option value="10">10+ Years</option>
          <option value="15">15+ Years</option>
        </select>
      </div>

      {/* Consultation Fee */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Consultation Fee</label>
        <select
          value={filterFee}
          onChange={(e) => setFilterFee(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
        >
          <option value="Any">Any Price</option>
          <option value="150">150 MAD or less</option>
          <option value="200">200 MAD or less</option>
          <option value="250">250 MAD or less</option>
        </select>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Gender</label>
        <div className="space-y-2">
          {["Any", "Male", "Female"].map((gender) => (
            <label key={gender} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="gender"
                checked={filterGender === gender}
                onChange={() => setFilterGender(gender)}
                className="w-4 h-4 text-blue-600 border-gray-300 outline-none"
              />
              <span>{gender === "Any" ? "All Genders" : gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Languages</label>
        <div className="space-y-2">
          {["Arabic", "English", "French"].map((lang) => (
            <label key={lang} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filterLanguages.includes(lang)}
                onChange={() => handleLanguageChange(lang)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded outline-none"
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Minimum Rating</label>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition"
        >
          <option value="Any">Any Rating</option>
          <option value="4.6">4.6+ Stars</option>
          <option value="4.8">4.8+ Stars</option>
        </select>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Availability</label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filterAvailability === "Available"}
            onChange={(e) => setFilterAvailability(e.target.checked ? "Available" : "Any")}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded outline-none"
          />
          <span>Available Today</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 py-12 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20" style={{ backgroundImage: "url('/img/SearchDoctors.png')" }}></div>
        <div className="relative space-y-2 px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide uppercase">Find Your Practitioner</h1>
          <p className="text-blue-100 text-sm max-w-md mx-auto">Browse verified healthcare professionals, filter by schedule or fee, and schedule checkups.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Mobile Filter Toggle & Search Output Info */}
        <div className="flex items-center justify-between lg:hidden mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 text-blue-600 font-bold text-sm"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
          <p className="text-xs text-gray-500 font-semibold">{filteredDoctors.length} doctors found</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Left Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            {renderSidebarContent()}
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search and Sort Topbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
              
              {/* Text Search input */}
              <div className="relative w-full md:max-w-md">
                <input
                  type="text"
                  placeholder="Search by doctor, specialty, city, or hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Sorting & Count */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <p className="hidden md:block text-sm text-gray-500 font-medium">{filteredDoctors.length} doctors found</p>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-sm rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="Default">Sort By: Default</option>
                  <option value="FeeLowHigh">Fee: Low to High</option>
                  <option value="FeeHighLow">Fee: High to Low</option>
                  <option value="ExpHighLow">Experience: High to Low</option>
                  <option value="RatingHighLow">Rating: High to Low</option>
                </select>
              </div>

            </div>

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center space-y-2">
                <p className="text-lg font-bold text-gray-700">No Doctors Found</p>
                <p className="text-gray-500 text-sm">Try broadening your search or resetting the filters.</p>
                <button 
                  onClick={resetFilters} 
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition text-sm shadow-md"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {currentDoctors.map((doc, idx) => (
                  <SearchDoctorCard
                    key={idx}
                    id={doc.id}
                    name={`${doc.firstname} ${doc.lastname}`}
                    avatar_doctor={doc.avatar_doctor}
                    day_debut_work={doc.day_debut_work}
                    day_fin_work={doc.day_fin_work}
                    time_debut_work={doc.time_debut_work}
                    time_fin_work={doc.time_fin_work}
                    specialite={doc.specialite}
                    available={doc.available}
                    nom_cabinet={doc.nom_cabinet}
                    rating={doc.rating}
                    fee={doc.consultation_fee}
                    experience={doc.years_of_experience}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  Previous
                </button>
                
                <span className="text-sm font-bold text-gray-500">
                  Page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages}</span>
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-sm"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />

      <AlertToRegistre
        showAlertToRegistre={showAlertToRegistre}
        setSowAlertToRegistre={setSowAlertToRegistre}
      />

      {/* Mobile Filters Modal Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileFilters(false)}></div>
          
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl flex flex-col h-full transform transition ease-in-out duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">Filters</h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1 text-gray-400 hover:text-gray-500 outline-none"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {renderSidebarContent()}
            </div>

            <div className="border-t border-gray-100 p-4 bg-gray-50 flex gap-3">
              <button 
                onClick={resetFilters}
                className="w-1/2 py-2.5 border border-gray-200 text-sm font-bold text-gray-600 rounded-xl bg-white hover:bg-gray-50 transition"
              >
                Clear All
              </button>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-1/2 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-md transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchDoctors;
