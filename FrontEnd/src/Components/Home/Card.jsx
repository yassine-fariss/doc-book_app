import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheckIcon } from "@heroicons/react/20/solid";

const Card = ({ id, img, name, specialite }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group" key={id}>
      <div className="relative h-56 w-full overflow-hidden bg-gray-50">
        <img
          src={img ? img : "img/Rectangle 5.jpg"}
          alt={name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-blue-600 p-1.5 rounded-full shadow-sm" title="Verified Practitioner">
          <ShieldCheckIcon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col space-y-4">
        <div className="text-left space-y-1">
          <h1 className="text-gray-900 font-extrabold text-lg line-clamp-1">{name}</h1>
          <p className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 inline-block px-2.5 py-1 rounded-md">{specialite}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-50">
          <Link 
            to={"/bookingappointment/" + id} 
            className="text-center py-2.5 px-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 hover:shadow-md transition"
          >
            {t("Card.Reserve")}
          </Link>
          <Link 
            to={"/doctor/" + id} 
            className="text-center py-2.5 px-2 bg-white text-gray-700 border border-gray-200 text-xs font-bold rounded-xl hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition"
          >
            {t("Card.View_Profile")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
