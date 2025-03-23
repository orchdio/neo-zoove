const HeadIcons = () => {
  return (
    <div>
      <div className="absolute w-10 h-10 bg-white shadow-xl rounded-full left-[12%] top-16 -z-10 pointer-events-none flex items-center justify-center">
        <img
          alt="Apple music icon"
          src="/applemusic/icons/light.svg"
          className="w-5 h-5"
        />
      </div>

      <div className="absolute w-10 h-10 bg-white shadow-xl rounded-full left-[85%] top-54 -z-10 pointer-events-none flex items-center justify-center">
        <img
          alt="Deezer icon"
          src="/deezer/icons/light.svg"
          className="w-4.5 h-4.5"
        />
      </div>

      <div className="absolute w-10 h-10 bg-white shadow-xl rounded-full left-[5%] top-54 -z-10 pointer-events-none flex items-center justify-center">
        <img
          alt="Spotify icon"
          src="/spotify/icons/light.svg"
          className="w-5 h-5"
        />
      </div>

      <div className="absolute w-10 h-10 bg-white shadow-xl rounded-full left-[75%] top-16 -z-10 pointer-events-none flex items-center justify-center">
        <img
          alt="Tidal icon"
          src="/tidal/icons/light.svg"
          className="w-5 h-5"
        />
      </div>
    </div>
  );
};

export default HeadIcons;
