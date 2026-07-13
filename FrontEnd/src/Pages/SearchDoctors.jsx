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

  // Load all doctors and set initial params
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
        const docs = res.data.DataSearch || [];
        
        // Enrich data with consistent mock fields since they are not in the standard DB schema
        const enriched = docs.map((doc) => {
          const docId = parseInt(doc.id) || 0;
          return {
            ...doc,
            fee: (docId % 4) * 50 + 150, // 150, 200, 250, 300 MAD
            experience: (docId % 12) + 6, // 6 to 17 Yrs
            rating: doc.rating ? parseFloat(doc.rating).toFixed(1) : (4.5 + ((docId % 5) * 0.1)).toFixed(1), // Use dynamic rating accessor if present
            gender: (docId % 2 === 0) ? "Male" : "Female",
            languages: (docId % 3 === 0) ? ["Arabic", "French"] : (docId % 3 === 1) ? ["Arabic", "English"] : ["Arabic", "French", "English"],
            hospital: doc.nom_cabinet || "General Hospital",
            city: doc.address_cabinet || "Casablanca",
          };
        });

        setAllDoctors(enriched);
        setFilteredDoctors(enriched);
        setLoading(false);

        // Read query parameters (e.g. from homepage redirect)
        const params = new URLSearchParams(location.search);
        setFilterSpecialty(params.get("specialite") || "");
        setFilterCity(params.get("city") || "");
      })
      .catch((err) => {
        console.error("Error fetching doctors list:", err);
        setLoading(false);
      });
  }, [location.search]);

  // Compute filter options dynamically from active dataset
  const specialtiesList = ["All Specialties", ...new Set(allDoctors.map((d) => d.specialite).filter(Boolean))];
  const citiesList = ["All Cities", ...new Set(allDoctors.map((d) => d.city).filter(Boolean))];
  const hospitalsList = ["All Hospitals", ...new Set(allDoctors.map((d) => d.hospital).filter(Boolean))];

  // Apply filters, search and sorting logic
  useEffect(() => {
    let result = [...allDoctors];

    // 1. General Text Search (Doctor Name, Specialty, City, Hospital)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (doc) => 
          (doc.firstname && doc.firstname.toLowerCase().includes(q)) ||
          (doc.lastname && doc.lastname.toLowerCase().includes(q)) ||
          (doc.specialite && doc.specialite.toLowerCase().includes(q)) ||
          (doc.city && doc.city.toLowerCase().includes(q)) ||
          (doc.hospital && doc.hospital.toLowerCase().includes(q))
      );
    }

    // 2. Specialty Filter
    if (filterSpecialty && filterSpecialty !== "All Specialties") {
      result = result.filter((doc) => doc.specialite === filterSpecialty);
    }

    // 3. City Filter
    if (filterCity && filterCity !== "All Cities") {
      result = result.filter((doc) => doc.city === filterCity);
    }

    // 4. Hospital Filter
    if (filterHospital && filterHospital !== "All Hospitals") {
      result = result.filter((doc) => doc.hospital === filterHospital);
    }

    // 5. Experience Filter
    if (filterExperience !== "Any") {
      const expMin = parseInt(filterExperience);
      result = result.filter((doc) => doc.experience >= expMin);
    }

    // 6. Fee Filter
    if (filterFee !== "Any") {
      const maxFee = parseInt(filterFee);
      result = result.filter((doc) => doc.fee <= maxFee);
    }

    // 7. Gender Filter
    if (filterGender !== "Any") {
      result = result.filter((doc) => doc.gender === filterGender);
    }

    // 8. Languages Filter
    if (filterLanguages.length > 0) {
      result = result.filter((doc) => 
        filterLanguages.every((lang) => doc.languages && doc.languages.includes(lang))
      );
    }

    // 9. Rating Filter
    if (filterRating !== "Any") {
      const minRating = parseFloat(filterRating);
      result = result.filter((doc) => parseFloat(doc.rating) >= minRating);
    }

    // 10. Availability Filter
    if (filterAvailability === "Available") {
      result = result.filter((doc) => doc.available === "1" || doc.available === true || doc.available === 1);
    }

    // 11. Sorting
    if (sortKey === "FeeLowHigh") {
      result.sort((a, b) => a.fee - b.fee);
    } else if (sortKey === "FeeHighLow") {
      result.sort((a, b) => b.fee - a.fee);
    } else if (sortKey === "ExpHighLow") {
      result.sort((a, b) => b.experience - a.experience);
    } else if (sortKey === "RatingHighLow") {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    setFilteredDoctors(result);
    setCurrentPage(1);
  }, [
    allDoctors,
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
                    nom_cabinet={doc.hospital}
                    rating={doc.rating}
                    fee={doc.fee}
                    experience={doc.experience}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition"
                >
                  Next
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
