import React from "react";
import { Footer, Header } from "../Components";
import { Link } from "react-router-dom";
import { 
  HeartIcon, 
  EyeIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  FlagIcon,
  CheckBadgeIcon
} from "@heroicons/react/20/solid";

export const Aboutus = () => {
  document.title = "About Us - DocAppoint";

  const coreValues = [
    {
      name: "Patient First",
      desc: "We prioritize patient care, ease of use, and convenience in everything we design and build.",
      icon: HeartIcon,
      color: "text-red-500 bg-red-50"
    },
    {
      name: "Certified Trust",
      desc: "All healthcare professionals listed on DocAppoint are thoroughly vetted and board certified.",
      icon: CheckBadgeIcon,
      color: "text-blue-500 bg-blue-50"
    },
    {
      name: "Data Confidentiality",
      desc: "We enforce strict end-to-end encryption protocols to secure medical files and personal logs.",
      icon: ShieldCheckIcon,
      color: "text-green-500 bg-green-50"
    },
    {
      name: "Continuous Innovation",
      desc: "We constantly refine our scheduling software to improve communication and diagnostic convenience.",
      icon: SparklesIcon,
      color: "text-yellow-500 bg-yellow-50"
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Jenkins",
      role: "Chief Medical Advisor",
      bio: "Over 15 years of clinical practice in cardiology. Leads doctor validation processes.",
      img: "/img/Rectangle 3.png"
    },
    {
      name: "Mouad Dadda",
      role: "Co-Founder & CEO",
      bio: "Healthcare enthusiast dedicated to making clinical consultations accessible.",
      img: "/img/Rectangle 5.jpg"
    },
    {
      name: "Yassine Mansour",
      role: "Lead Software Architect",
      bio: "Full stack engineer focused on data security, performance, and scaling.",
      img: "/img/Rectangle 9.png"
    }
  ];

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-[300px] bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35" style={{ backgroundImage: "url('https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}></div>
        <div className="relative text-center text-white px-4 space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide uppercase">About DocAppoint</h1>
          <p className="mt-2 text-blue-100 font-light max-w-xl mx-auto text-sm md:text-base">Innovating patient-provider communication to make healthcare booking quick, simple, and reliable.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 bg-gray-50/20">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-100">
              <SparklesIcon className="w-4 h-4" />
              Our Story
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">Bridging the Gap Between Patients and Doctors</h2>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Founded in 2024, DocAppoint emerged from a simple observation: scheduling medical checkups was unnecessarily slow, relying on busy phone lines and paperwork. We set out to design an automated platform that makes finding specialized help instant.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Today, we serve thousands of patients every month, bridging location gaps and giving users comprehensive access to dynamic profiles, clinic working schedules, transparent consultation fees, and certified reviews.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-3xl blur-3xl opacity-30"></div>
            <img 
              src="./img/Doctors2.jpg" 
              alt="Medical consultation illustration" 
              className="relative rounded-3xl shadow-md border border-gray-100 object-cover w-full h-[350px] lg:h-[400px]" 
            />
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col items-center md:items-start text-center md:text-left transition-all hover:shadow-md">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FlagIcon className="w-6 h-6" />
            </span>
            <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              To make clinical consults accessible in seconds by providing secure, transparent, and direct patient-provider booking channels.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col items-center md:items-start text-center md:text-left transition-all hover:shadow-md">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <EyeIcon className="w-6 h-6" />
            </span>
            <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              To establish the world's most reliable and patient-centric digital healthcare scheduling and clinic management directory.
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-lg text-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y-0 divide-x-0 lg:divide-x divide-white/10 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-extrabold">15,000+</p>
              <p className="text-blue-100 font-semibold mt-2 text-xs uppercase tracking-wider">Booked Consults</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold">99%</p>
              <p className="text-blue-100 font-semibold mt-2 text-xs uppercase tracking-wider">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold">250+</p>
              <p className="text-blue-100 font-semibold mt-2 text-xs uppercase tracking-wider">Certified Doctors</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold">100+</p>
              <p className="text-blue-100 font-semibold mt-2 text-xs uppercase tracking-wider">Clinic Partnerships</p>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="space-y-12">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Core Values</h2>
            <p className="text-gray-500">These beliefs shape our operations, design practices, and support guidelines.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => {
              const IconComp = val.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 transition hover:-translate-y-1 hover:shadow-md duration-200 text-left">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${val.color}`}>
                    <IconComp className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-gray-900 text-base">{val.name}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meet the Team Section */}
        <div className="space-y-12">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900">Meet Our Team</h2>
            <p className="text-gray-500">Dedicated professionals working behind the scenes to deliver a trusted health network.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 flex flex-col items-center text-center space-y-4 transition hover:-translate-y-1 hover:shadow-md duration-200">
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-sm" 
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{member.name}</h4>
                  <p className="text-blue-600 text-xs font-semibold uppercase mt-0.5">{member.role}</p>
                </div>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-xs">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg')" }}></div>
          <div className="relative max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold">Ready to Experience Better Healthcare?</h2>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Find certified doctors, compare available schedule slots, and schedule your appointment today.
            </p>
          </div>
          <div className="relative">
            <Link to="/recherche" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition shadow-md">
              Find a Doctor Now
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
};

export default Aboutus;
