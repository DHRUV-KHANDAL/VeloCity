// src/components/common/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Car } from 'lucide-react';
import useAuth from '../../hooks/useAuth';  // ✅ Import from hooks

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 group-hover:shadow-lg transition-shadow">
              <Car className="h-6 w-6 text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold text-gray-900">VeloCity</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</Link>
            {user && user.role === 'rider' && (
              <Link to="/rider" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Book Ride</Link>
            )}
            {user && user.role === 'driver' && (
              <Link to="/driver" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Drive Now</Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Logout">
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">Sign In</Link>
                <Link to="/register" className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-shadow">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>
            {user && user.role === 'rider' && (
              <Link to="/rider" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Book Ride</Link>
            )}
            {user && user.role === 'driver' && (
              <Link to="/driver" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Drive Now</Link>
            )}
            <div className="border-t border-gray-200 pt-3">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium">Logout</button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="block px-4 py-2 text-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;