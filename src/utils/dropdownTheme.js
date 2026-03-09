/**
 * Standardized dropdown and input themes for the Tutorial Center application.
 * Focuses on premium aesthetics, smooth transitions, and conditional typography.
 */

export const dropdownTheme = {
  // Container for the input/select with icon
  inputContainer: (hasError, isFocused) => `
    flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all duration-300
    ${hasError ? "border-red-400 bg-red-50" : isFocused ? "border-[#09314F] bg-white shadow-lg shadow-[#09314F11]" : "border-transparent"}
  `,

  // Text styling based on whether it has a value
  getValueStyle: (hasValue) => `
    bg-transparent w-full outline-none transition-all duration-300
    ${hasValue ? "text-[#09314F]" : "text-gray-400 font-medium"}
  `,

  // Standard icon colors
  iconStyle: (hasValue, isFocused) => `
    h-5 w-5 mr-3 transition-colors duration-300
    ${isFocused ? "text-[#09314F]" : hasValue ? "text-[#09314F]" : "text-gray-400"}
  `,

  // Select specific styles (hiding default arrow)
  select: "appearance-none cursor-pointer",

  // Custom arrow for selects
  chevron: "h-4 w-4 text-gray-400 -rotate-90 pointer-events-none ml-2",

  // Option items inside native selects
  option: "bg-[#F7EFEF] text-[#09314F] font-medium",

  /* --- Specialized Table Overlay Dropdown Styles --- */
  overlay: {
    // The floating card
    container: "absolute top-full left-0 z-[100] mt-2 bg-[#F9E7E6] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-black/5 p-4 animate-fadeIn max-h-[300px] overflow-y-auto",
    header: "text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3 px-2",
    // Individual items within the overlay
    item: (isSelected, isLimitReached) => `
      w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-xs font-bold
      ${isSelected
        ? "bg-[#7FD093] text-white shadow-sm"
        : isLimitReached
          ? "opacity-40 grayscale cursor-not-allowed"
          : "hover:bg-white/50 text-[#09314F]"}
    `
  },

  /* --- Subject Tag Styles --- */
  tag: "text-[10px] font-black text-[#09314F] uppercase bg-white px-2 py-1 rounded-lg border border-[#09314F11] whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] inline-block align-middle flex-shrink-1 min-w-0",

  /* --- Mockup-Specific Subject Preview --- */
  subjectPreview: "text-[11px] font-medium text-[#09314F] truncate bg-[#E2E4E7] px-3 py-2 rounded-lg w-full text-left"
};
