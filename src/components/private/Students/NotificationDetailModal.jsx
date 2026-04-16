import React from "react";
import { XMarkIcon, TrashIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function NotificationDetailModal({ notification, onClose, onDelete }) {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-[#09314F] w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100 dark:border-[#1a4a75]">
        
        {/* Header/Banner Area */}
        <div className="bg-[#09314F] dark:bg-[#06243A] p-10 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-2xl transition-all text-white/50 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg ${
              notification.data?.type === "success" ? "bg-green-500" : "bg-blue-500"
            }`}>
              {notification.data?.type === "success" ? (
                <CheckCircleIcon className="w-8 h-8" />
              ) : (
                <InformationCircleIcon className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-tight capitalize">
                {notification.data?.type || "Notification"}
              </h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                Details View
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10">
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed mb-8">
            {notification.data?.message || "No content available."}
          </p>
          
          <div className="flex items-center justify-between py-6 border-t border-gray-50 dark:border-[#1a4a75]">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Received On</span>
            <span className="text-xs font-bold text-[#09314F] dark:text-gray-200">
              {new Date(notification.created_at).toLocaleDateString(undefined, { 
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-8 bg-gray-50/50 dark:bg-[#06243A]/50 flex items-center gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] text-[#09314F] dark:text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-[#1a4a75] transition-all active:scale-95 shadow-sm"
          >
            Close
          </button>
          <button 
            onClick={() => onDelete(notification.id)}
            className="flex-shrink-0 p-4 bg-red-50 dark:bg-red-900/10 text-red-500 border border-red-100 dark:border-red-900/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm group"
            title="Delete Notification"
          >
            <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
