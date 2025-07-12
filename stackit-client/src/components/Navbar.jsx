import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BellIcon from './BellIcon';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white border-b shadow-sm p-4 flex justify-between items-center relative z-50">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-indigo-600">StackIt</Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        <Link to="/ask" className="text-sm font-medium hover:underline">
          Ask Question
        </Link>

        <BellIcon />

        {user ? (
          <>
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-blue-500 hover:underline">Login</Link>
            <Link to="/register" className="text-sm text-green-500 hover:underline">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-16 right-4 w-48 bg-white border shadow-lg rounded p-4 flex flex-col gap-3 md:hidden z-50">
          <Link to="/ask" onClick={() => setMenuOpen(false)}>
            Ask Question
          </Link>

          <BellIcon />

          {user ? (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-sm text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-blue-500">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-green-600">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
