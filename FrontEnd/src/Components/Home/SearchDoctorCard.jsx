import React from "react";
import { ClockIcon, StarIcon, BriefcaseIcon, CurrencyDollarIcon, AcademicCapIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";

const SearchDoctorCard = ({
  name,
  id,
  avatar_doctor,
  day_debut_work,
  day_fin_work,
  specialite,
  available,
  time_fin_work,
  time_debut_work,
  nom_cabinet,
  rating,
  fee,
  experience,
}) => {

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

  const isAvailable = available === "1" || available === true || available === 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between p-5 relative hover:shadow-md hover:border-blue-100 transition duration-300">
      
      {/* Availability Badge */}
      <div className="absolute top-4 right-4 z-10">
        {isAvailable ? (
          <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Available
          </span>
        ) : (
          <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Busy
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Doctor Photo */}
        <div className="relative rounded-xl overflow-hidden h-[180px] bg-gray-50 border border-gray-100 flex items-center justify-center">
          <img
            src={getDoctorAvatar(avatar_doctor)}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            alt={`Dr. ${name}`}
          />
        </div>

        {/* Doctor Basic Details */}
        <div className="space-y-2 text-left">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-snug">Dr. {name}</h3>
            <p className="text-blue-600 font-semibold text-xs mt-0.5 uppercase tracking-wider">{specialite || "Specialist"}</p>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            <StarIcon className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="text-gray-700 font-bold text-xs">{rating || "4.8"}</span>
            <span className="text-gray-400 text-xs">/ 5.0 Rating</span>
          </div>
          
          <div className="border-t border-gray-50 pt-2 space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">Clinic: <strong className="text-gray-800">{nom_cabinet || "General Clinic"}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Experience: <strong className="text-gray-800">{experience || "8"}+ Yrs</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Fee: <strong className="text-gray-800">{fee || "150"} MAD</strong></span>
            </div>

            {day_debut_work && day_fin_work && (
              <div className="flex items-start gap-2">
                <ClockIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span className="capitalize">{day_debut_work} - {day_fin_work}, {time_debut_work} - {time_fin_work}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-5">
        <Link to={`/doctor/${id}`} className="w-full">
          <button className="w-full text-center py-2 px-3 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition duration-200">
            View Profile
          </button>
        </Link>
        <Link to={`/bookingappointment/${id}`} className="w-full">
          <button className="w-full text-center py-2 px-3 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 hover:shadow-md transition duration-200">
            Book Now
          </button>
        </Link>
      </div>

    </div>
  );
};

export default SearchDoctorCard;
