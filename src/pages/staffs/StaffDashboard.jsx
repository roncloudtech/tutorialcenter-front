import React from "react";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";

import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  UserGroupIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function StaffDashboard() {
  return (
    <StaffDashboardLayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 flex items-center text-sm">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            &lt; Back /
          </button>
          <h2 className="ml-1 font-bold text-gray-900 dark:text-white">
            Add Staff
          </h2>
        </div>

        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl">
          <form className="space-y-4">
            
            {/* Top Section: Image Upload + First 4 Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Image Upload Box */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-48 lg:h-full relative overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                  backgroundSize: `20px 20px`,
                  backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
                }}
              >
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-xs text-center text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                  Click/drag and<br />drop to upload
                </div>
              </div>

              {/* Name & Contact Inputs */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">First Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                    <input type="text" placeholder="first name" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Last Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                    <input type="text" placeholder="last name" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                    <input type="email" placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Email / Phone Number</label>
                  <div className="relative">
                    <EnvelopeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                    <input type="tel" placeholder="+234 XXX XXXX XXXX" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Gender</label>
                <div className="relative">
                  <PencilIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-500">
                    <option value="">select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Date of Birth</label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <input type="text" placeholder="-- / -- / ----" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.value === '' ? e.target.type = 'text' : null} />
                </div>
              </div>

              {/* Role (Full Width) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Role</label>
                <div className="relative">
                  <UserGroupIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-500">
                    <option value="">select role</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Status</label>
                <div className="relative">
                  <UserGroupIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-500">
                    <option value="">select status</option>
                  </select>
                </div>
              </div>

              {/* Class Title */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Class Title <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <input type="text" placeholder="enter class title" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Location</label>
                <div className="relative">
                  <MapPinIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-500">
                    <option value="">select location</option>
                  </select>
                </div>
              </div>

              {/* Home Address */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Home Address</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <input type="text" placeholder="enter home address" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <DocumentTextIcon className="w-4 h-4 absolute left-3 top-3 text-gray-700" />
                  <textarea rows="4" placeholder="type in your description" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full rounded-lg bg-[#09314F] hover:bg-[#051b2b] text-white font-semibold py-3.5 text-sm transition-colors shadow-md"
              >
                Register
              </button>
            </div>

          </form>
        </section>
      </div>
    </StaffDashboardLayout>
  );
}