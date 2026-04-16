const MapSection = () => {
  return (
    <div className="w-full h-[400px]">
      <iframe
        title="map"
        src="https://www.google.com/maps?q=Lagos&output=embed"
        className="w-full h-full border-0"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default MapSection;