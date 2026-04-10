import React from "react";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";

const RecordedClasses = () => {
  // Example YouTube video ID - replace with dynamic data as needed
  const videoId = "dQw4w9WgXcQ"; // Rickroll for demo, change to actual class video

  return (
    <DashboardLayout
      pagetitle="Classes Review"
    >
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Recorded Classes
          </h1>
          <p className="text-gray-600 mb-6">
            Watch recorded class sessions below.
          </p>

          <div className="w-full h-[520px] md:h-[720px] lg:h-[860px] overflow-hidden rounded-3xl bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Recorded Class Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Placeholder for future features like video list or controls */}
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Note: This is a basic implementation. You can expand this to
              include a list of videos, search, or dynamic video loading.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecordedClasses;
