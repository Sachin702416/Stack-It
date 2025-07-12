import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md relative z-50">
      <div className="max-w-[85rem] mx-auto flex justify-between items-center">
        {/* 🔹 Logo */}
        <Link to="/" className=" text-4xl font-extrabold tracking-wide text-white0">
          Stackit
        </Link>

        {/* 🔹 Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {/* <Link to="/ask" className="text-sm font-semibold hover:underline hover:text-yellow-200 transition">
            Ask Question
          </Link> */}

          {currentUser && (
            <div className="relative">
              <FaBell className="text-white text-xl hover:text-yellow-300 cursor-pointer" />
              {/* Notification dot example */}
              <span className="absolute -top-1 -right-1 bg-red-500 h-2 w-2 rounded-full"></span>
            </div>
          )}

          <div className="flex items-center gap-3 gap-x-4">
            {currentUser ? (
              <>
                <p className="text-sm font-medium">Hi, <span className="text-yellow-200">{currentUser.email}</span></p>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 bg-blue-100 rounded-md px-4 py-1.5 text-sm rounded-lg shadow"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-md text-black font-semibold px-6 py-1.5 bg-white rounded-md hover:scale-105">
                  Login
                </Link>
                <Link to="/signup" className="text-md text-black font-semibold px-6 py-1.5 bg-white rounded-md hover:scale-105">
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
            className="text-2xl focus:outline-none text-white"
          >
            ☰
          </button>
        </div>
      </div>

      {/* 🔹 Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-4 w-56 bg-white text-gray-800 border border-gray-200 shadow-xl rounded-md p-4 flex flex-col gap-3 md:hidden z-50">
          <Link
            to="/ask"
            onClick={() => setMenuOpen(false)}
            className="hover:underline font-medium text-indigo-600"
          >
            Ask Question
          </Link>

          {currentUser && (
            <div className="flex items-center gap-2">
              <FaBell className="text-indigo-600 text-lg" />
              <span className="text-sm">Notifications</span>
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
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-blue-600 text-sm hover:underline"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-green-600 text-sm hover:underline"
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
