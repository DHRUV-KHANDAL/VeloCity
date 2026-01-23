// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    Product: [{ name: 'Ride Booking', path: '/' }, { name: 'Drive with Us', path: '/' }, { name: 'Pricing', path: '/' }],
    Company: [{ name: 'About Us', path: '/' }, { name: 'Careers', path: '/' }, { name: 'Blog', path: '/' }],
    Support: [{ name: 'Help Center', path: '/' }, { name: 'Safety', path: '/' }, { name: 'Contact', path: '/' }],
    Legal: [{ name: 'Terms', path: '/' }, { name: 'Privacy', path: '/' }, { name: 'Cookies', path: '/' }],
  };

  const socials = [
    { icon: Facebook, url: '#', label: 'Facebook' },
    { icon: Twitter, url: '#', label: 'Twitter' },
    { icon: Instagram, url: '#', label: 'Instagram' },
    { icon: Linkedin, url: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Car className="h-6 w-6 text-white" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-white">VeloCity</h3>
            </div>
            <p className="text-gray-400 mb-6">Experience seamless transportation with VeloCity. Book rides in seconds, track your driver in real-time.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <span>support@velocity.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>123 Ride Street, City</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerSections).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-lg font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="hover:text-white transition-colors duration-200">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-12"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm">© {currentYear} VeloCity. All rights reserved.</p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <a key={social.label} href={social.url} className="h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors duration-200">
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;