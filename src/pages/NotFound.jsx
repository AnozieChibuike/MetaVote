import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import React from "react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-6">
      <h1 className="text-9xl font-bold text-red-500">404</h1>
      <h2 className="text-3xl sm:text-5xl font-semibold mt-4">Oops! Page Not Found</h2>
      <p className="text-gray-400 mt-4 max-w-lg">
        The page you are looking for does not exist, or has been moved. Let's get you back on track.
      </p>
      <Button color="blue" className="mt-6 px-6 py-3 text-lg" onClick={() => navigate("/")}>
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;
