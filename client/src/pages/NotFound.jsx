import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-5 py-12">
      <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold text-black leading-none">
        404
      </h1>

      <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xs sm:max-w-sm leading-relaxed">
        Oops! The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-8 px-8 py-3 bg-black text-white text-sm sm:text-base rounded-full
                   hover:bg-gray-800 active:scale-95 transition-all duration-200
                   min-h-11 flex items-center justify-center"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;