import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    await logout();
    toast.success("Logged out successfully.");
    navigate('/login');
  } catch (error) {
    toast.error("Logout failed.");
  }
};

  return (
    <nav className="bg-white border-b shadow-sm p-4 flex justify-between items-center relative z-50">
      {/* 🔹 Logo */}
      <Link to="/" className="text-xl font-bold text-indigo-600">
        StackIt
      </Link>

      {/* 🔹 Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        <Link to="/ask" className="text-sm font-medium hover:underline">
          Ask Question
        </Link>

        {/* Bell Icon (show only if logged in) */}
        {currentUser && (
          <div className="relative">
            <FaBell className="text-gray-600 text-xl hover:text-indigo-600 cursor-pointer" />
            {/* Optional dot */}
            {/* <span className="absolute top-0 right-0 bg-red-500 h-2 w-2 rounded-full"></span> */}
          </div>
        )}

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <p className="text-sm text-gray-700">Hi, {currentUser.email}</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                Login
              </Link>
              <Link to="/signup" className="text-sm text-indigo-600 hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 🔹 Mobile Hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* 🔹 Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-4 w-52 bg-white border shadow-lg rounded-md p-4 flex flex-col gap-3 md:hidden z-50">
          <Link
            to="/ask"
            onClick={() => setMenuOpen(false)}
            className="hover:underline"
          >
            Ask Question
          </Link>

          {currentUser && (
            <div className="flex items-center gap-2">
              <FaBell className="text-gray-600 text-lg" />
            </div>
          )}

          {currentUser ? (
            <>
              <span className="text-sm text-gray-700">{currentUser.email}</span>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-sm text-red-500 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-blue-600 hover:underline"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-green-600 hover:underline"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
