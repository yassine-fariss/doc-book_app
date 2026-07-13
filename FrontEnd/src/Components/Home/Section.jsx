import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../Assets/Css/HomeCss/Section.css";
import Card from "./Card";
import axiosClient from "../../AxiosClient";
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  StarIcon,
  ArrowRightIcon,
  UserGroupIcon
} from "@heroicons/react/20/solid";

const Section = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  
  // Search Bar state
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchCity, setSearchCity] = useState("");

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    axiosClient
      .post("/doctor/home")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = [];
    if (searchSpecialty && searchSpecialty !== "All Specialties") {
      queryParams.push(`specialite=${encodeURIComponent(searchSpecialty)}`);
    }
    if (searchCity && searchCity !== "All Cities") {
      queryParams.push(`city=${encodeURIComponent(searchCity)}`);
    }
    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    navigate(`/recherche${queryString}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const specialties = [
    { name: "Cardiology", icon: "❤️", desc: "Heart and blood vessels care" },
    { name: "Dermatology", icon: "☀️", desc: "Skin, hair, and nails health" },
    { name: "Neurology", icon: "🧠", desc: "Brain and nervous system support" },
    { name: "Pediatrics", icon: "🧸", desc: "Infants and children healthcare" },
    { name: "General Medicine", icon: "🩺", desc: "Comprehensive primary healthcare" },
    { name: "Ophthalmology", icon: "👁️", desc: "Vision and eye health diagnostics" }
  ];

  const faqs = [
    {
      q: "How do I book an appointment?",
      a: "Simply search for a doctor by specialty or city using the search bar, click 'View Profile' to check their available slots, and book using our secure scheduling sidebar."
    },
    {
      q: "Can I cancel or reschedule my appointment?",
      a: "Yes! You can manage your appointments directly from your patient portal dashboard. Cancellations are free of charge up to 24 hours prior to the consult."
    },
    {
      q: "Are my medical records safe?",
      a: "Absolutely. We employ end-to-end encryption standards to secure your personal info and medical documentation, keeping your data confidential."
    },
    {
      q: "Do you support virtual consultations?",
      a: "Yes, many of our listed practitioners offer telehealth video appointments. You can choose 'Video Consult' during your booking setup."
    }
  ];

  return (
    <div className="space-y-20 bg-gray-50/50 pb-20">
      
      {/* Hero & Search Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50/30 overflow-hidden py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-100">
              <CheckCircleIcon className="w-4 h-4" />
              Easy Medical Consultations
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Find the Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Doctors</span> Near You
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto lg:mx-0">
              DocAppoint makes scheduling healthcare appointments fast, secure, and stress-free. Book certified professionals in just a few clicks.
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link to="/recherche" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg transition">
                Book Appointment
              </Link>
              <Link to="/about" className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition">
                Learn More
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden lg:block relative justify-self-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-300 rounded-full blur-3xl opacity-20 scale-75"></div>
            <img 
              src="./img/doctor-2.png" 
              className="relative max-w-md w-full object-contain mx-auto drop-shadow-xl" 
              alt="Healthcare professional illustration" 
            />
          </div>

        </div>

        {/* Floating Doctor Search Bar */}
        <div className="max-w-4xl mx-auto px-4 mt-12 md:mt-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              {/* Specialty Select */}
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-blue-500 transition">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 outline-none w-full cursor-pointer"
                >
                  <option value="">Choose Specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              {/* City Select */}
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-blue-500 transition">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 outline-none w-full cursor-pointer"
                >
                  <option value="">Choose City</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Tangier">Tangier</option>
                  <option value="Fes">Fes</option>
                </select>
              </div>

              {/* Search Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Search Doctors
              </button>

            </form>
          </div>
        </div>

      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-y-0 divide-x-0 lg:divide-x divide-gray-100">
            <div className="text-center lg:px-4">
              <p className="text-4xl md:text-5xl font-extrabold text-blue-600">15K+</p>
              <p className="text-gray-500 font-medium mt-2 text-sm uppercase tracking-wider">Active Patients</p>
            </div>
            <div className="text-center lg:px-4">
              <p className="text-4xl md:text-5xl font-extrabold text-blue-600">250+</p>
              <p className="text-gray-500 font-medium mt-2 text-sm uppercase tracking-wider">Certified Doctors</p>
            </div>
            <div className="text-center lg:px-4">
              <p className="text-4xl md:text-5xl font-extrabold text-blue-600">98%</p>
              <p className="text-gray-500 font-medium mt-2 text-sm uppercase tracking-wider">Satisfaction Rate</p>
            </div>
            <div className="text-center lg:px-4">
              <p className="text-4xl md:text-5xl font-extrabold text-blue-600">12+</p>
              <p className="text-gray-500 font-medium mt-2 text-sm uppercase tracking-wider">Specialties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Explore Medical Specialties</h2>
          <p className="text-gray-500">Access specialized care by browsing medical experts across multiple fields.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((spec, index) => (
            <Link 
              key={index} 
              to={`/recherche?specialite=${spec.name}`}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 transition hover:-translate-y-1 hover:shadow-md hover:border-blue-100 duration-200"
            >
              <span className="text-3xl bg-blue-50/50 p-3 rounded-xl block shrink-0">{spec.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{spec.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{spec.desc}</p>
                <span className="text-blue-600 text-xs font-semibold inline-flex items-center gap-1 mt-3">
                  Find Specialists <ArrowRightIcon className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Doctors Section */}
      {doctors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900">Featured Premium Doctors</h2>
              <p className="text-gray-500">Schedule appointments with highly rated local practitioners.</p>
            </div>
            <Link to="/recherche" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700">
              View All Doctors <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {doctors.slice(0, 4).map((info, idx) => (
              <Card
                key={idx}
                id={info.id}
                img={info.avatar_doctor}
                name={`${info.firstname} ${info.lastname}`}
                specialite={info.specialite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Why Choose DocAppoint</h2>
          <p className="text-gray-500">We align technology and medicine to offer a premium, simple booking experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              <ShieldCheckIcon className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-lg text-gray-900">Verified Practitioners</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Every single doctor goes through background checks and credential validation before listings go live.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              <ClockIcon className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-lg text-gray-900">Real-Time Scheduling</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Select date, view hourly slots, and book instantly. No phone holds or manual waiting lists required.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              <UserGroupIcon className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-lg text-gray-900">Patient-Centric Care</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Read real customer ratings, manage diagnostic history files, and print structured invoice PDFs.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="text-gray-500">Get connected with professional practitioners in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Step 1 */}
            <div className="text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">1</div>
              <h3 className="font-bold text-lg text-gray-900 mt-4">Find a Doctor</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Filter experts by medical specialty, location, or name using the home search box.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">2</div>
              <h3 className="font-bold text-lg text-gray-900 mt-4">Pick a Time</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Compare clinic details, view the practitioner's active calendar schedule, and pick a slot.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">3</div>
              <h3 className="font-bold text-lg text-gray-900 mt-4">Receive Confirmation</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Verify details online and immediately download your appointment confirmation invoice PDF.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">What Our Patients Say</h2>
          <p className="text-gray-500">Discover experiences shared by our global healthcare community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-yellow-400">
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
            </div>
            <p className="text-gray-600 italic text-sm">
              "Booking appointments was always a chore. With DocAppoint, it takes seconds. I secured a cardiologist slot and downloaded my invoice instantly!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">H</div>
              <div>
                <p className="text-sm font-bold text-gray-800">Houssam E.</p>
                <p className="text-xs text-gray-400">Patient since 2025</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-yellow-400">
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
            </div>
            <p className="text-gray-600 italic text-sm">
              "The dynamic doctor profile page has everything—clinic address, phone, fee details, and even reviews! It made choosing my kids' pediatrician so much easier."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">M</div>
              <div>
                <p className="text-sm font-bold text-gray-800">Maria S.</p>
                <p className="text-xs text-gray-400">Patient since 2026</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-yellow-400">
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
              <StarIcon className="w-5 h-5" />
            </div>
            <p className="text-gray-600 italic text-sm">
              "I love the clean interface and the fact that I don't have to wait on the phone anymore. The system links all my files securely. Extremely satisfied."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">Y</div>
              <div>
                <p className="text-sm font-bold text-gray-800">Youssef K.</p>
                <p className="text-xs text-gray-400">Patient since 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-500">Got questions? We have answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-800 hover:bg-gray-50 transition outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="p-5 border-t border-gray-50 text-sm text-gray-600 leading-relaxed bg-gray-50/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-lg text-white text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg')" }}></div>
          
          <div className="relative space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold">Stay Informed, Live Healthier</h2>
            <p className="text-blue-100 text-sm md:text-base">
              Subscribe to the DocAppoint newsletter to receive certified health tips, medical guidelines, and platform updates.
            </p>
          </div>

          <div className="relative max-w-md mx-auto">
            {newsletterSubscribed ? (
              <div className="bg-green-500/25 border border-green-400/30 text-green-100 font-semibold p-4 rounded-xl text-sm flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-5 h-5 shrink-0" />
                Thank you for subscribing to our newsletter!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email address" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 text-sm px-4 py-3 rounded-xl outline-none focus:bg-white/20 transition"
                />
                <button className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition shrink-0 shadow-md">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Section;
