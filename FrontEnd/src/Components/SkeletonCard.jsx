import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden animate-pulse min-h-[380px] text-left">
      
      {/* Top Header Card Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar Circle */}
          <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0"></div>
          {/* Name & Specialite Lines */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-3 bg-gray-150 rounded-md w-1/2"></div>
          </div>
        </div>

        {/* Separator line */}
        <div className="border-t border-gray-100 pt-3 space-y-2">
          {/* Hospital Row */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0"></div>
            <div className="h-3 bg-gray-200 rounded-md w-2/3"></div>
          </div>
          {/* Experience Row */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0"></div>
            <div className="h-3 bg-gray-200 rounded-md w-1/3"></div>
          </div>
          {/* Schedule Row */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0"></div>
            <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="border-t border-gray-100 pt-4 mt-6 flex items-center justify-between">
        {/* Rating Placeholder */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0"></div>
          <div className="h-3 bg-gray-200 rounded-md w-8"></div>
        </div>
        {/* Fee & Button Placeholders */}
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded-md w-14"></div>
          <div className="h-9 bg-gray-200 rounded-full w-24"></div>
        </div>
      </div>

    </div>
  );
};

export default SkeletonCard;
