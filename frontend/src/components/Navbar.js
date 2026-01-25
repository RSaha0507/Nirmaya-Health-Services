// src/components/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, LogIn, UserPlus, LogOut, ChevronDown } from 'lucide-react';
import { allDepartments } from '../data';

const Navbar = ({ activePage, navigateTo, currentUser, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
  const [isMobileDepartmentsOpen, setIsMobileDepartmentsOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  
  const servicesRef = useRef(null);
  const departmentsRef = useRef(null);

  const navLinks = [
    { name: 'Home', page: 'Home' },
    { name: 'About Us', page: 'About' },
  ];

  const servicesLinks = [
    { name: 'Find a Doctor', page: 'Doctors' },
    { name: 'Book Appointment', page: 'Appointments' },
    { name: 'Health Checkup', page: 'HealthCheck' },
    { name: 'Health Library', page: 'HealthLibrary' },
    { name: 'Ambulance Service', page: 'Ambulance' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) setIsServicesOpen(false);
      if (departmentsRef.current && !departmentsRef.current.contains(event.target)) setIsDepartmentsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMobileNav = (page) => {
    navigateTo(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo('Home')}>
          <img src="/logo.png" alt="Nirmaya Health Logo" className="h-10 w-auto" /> 
          <h1 className="text-2xl font-bold text-green-800">Nirmaya Health</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <button key={link.page} onClick={() => navigateTo(link.page)} className={`text-gray-600 hover:text-yellow-500 transition duration-300 font-medium pb-2 ${activePage === link.page ? 'border-b-2 border-yellow-500 text-blue-600' : ''}`}>
              {link.name}
            </button>
          ))}
          
          <div className="relative" ref={departmentsRef}>
            <button onClick={() => setIsDepartmentsOpen(!isDepartmentsOpen)} className="flex items-center text-gray-600 hover:text-amber-600 transition duration-300 font-medium pb-2">
              Departments <ChevronDown size={18} className={`ml-1 transition-transform ${isDepartmentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDepartmentsOpen && (
              <div className="absolute top-full mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20">
                {allDepartments.map(dept => (
                  <button key={dept.name} onClick={() => { navigateTo(`${dept.name}Page`); setIsDepartmentsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-yellow-600">
                    {dept.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={servicesRef}>
            <button onClick={() => setIsServicesOpen(!isServicesOpen)} className="flex items-center text-gray-600 hover:text-amber-600 transition duration-300 font-medium pb-2">
              Our Services <ChevronDown size={18} className={`ml-1 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isServicesOpen && (
              <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                {servicesLinks.map(link => (
                  <button key={link.page} onClick={() => { navigateTo(link.page); setIsServicesOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-yellow-600">
                    {link.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {currentUser ? (
            <>
              {currentUser.role === 'admin' && <button onClick={() => navigateTo('AdminDashboard')} className="font-semibold text-blue-600 hover:text-blue-800">Admin</button>}
              {currentUser.role === 'doctor' && <button onClick={() => navigateTo('DoctorPortal')} className="font-semibold text-blue-600 hover:text-blue-800">My Portal</button>}
              {currentUser.role === 'user' && <button onClick={() => navigateTo('UserDashboard')} className="font-semibold text-gray-600 hover:text-blue-600">My Account</button>}
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-600 transition duration-300 flex items-center space-x-2"><LogOut size={18}/><span>Logout</span></button>
            </>
          ) : (
            <>
              <button onClick={() => navigateTo('Login')} className="font-semibold text-gray-600 hover:text-yellow-700 flex items-center space-x-2"><LogIn size={18}/><span>Login</span></button>
              <button onClick={() => navigateTo('SignUp')} className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-amber-600 transition duration-300 flex items-center space-x-2"><UserPlus size={18}/><span>Sign Up</span></button>
            </>
          )}
        </div>
        
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-amber-600 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path></svg>
          </button>
        </div>
      </div>

      {/* --- CORRECTED MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white py-2">
          {navLinks.map((link) => (<button key={link.page} onClick={() => handleMobileNav(link.page)} className="block w-full text-left px-6 py-2 text-gray-600 hover:bg-amber-50 hover:text-yellow-600">{link.name}</button>))}
          
          {/* Mobile Departments Dropdown */}
          <div className="px-6 py-2 mt-2 border-t">
            <button onClick={() => setIsMobileDepartmentsOpen(!isMobileDepartmentsOpen)} className="w-full flex justify-between items-center font-semibold text-gray-500 text-sm uppercase">
              Departments
              <ChevronDown size={18} className={`transition-transform ${isMobileDepartmentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMobileDepartmentsOpen && (
              <div className="mt-2">
                {allDepartments.map((dept) => (<button key={dept.name} onClick={() => handleMobileNav(`${dept.name}Page`)} className="block w-full text-left pl-4 pr-6 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">{dept.name}</button>))}
              </div>
            )}
          </div>

          {/* Mobile Services Dropdown */}
          <div className="px-6 py-2 mt-2 border-t">
            <button onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)} className="w-full flex justify-between items-center font-semibold text-gray-500 text-sm uppercase">
              Our Services
              <ChevronDown size={18} className={`transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMobileServicesOpen && (
              <div className="mt-2">
                {servicesLinks.map((link) => (<button key={link.page} onClick={() => handleMobileNav(link.page)} className="block w-full text-left pl-4 pr-6 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">{link.name}</button>))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t mt-2">
            {currentUser ? (
              <>
                {currentUser.role === 'admin' && <button onClick={() => handleMobileNav('AdminDashboard')} className="block w-full text-left py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">Admin Dashboard</button>}
                {currentUser.role === 'doctor' && <button onClick={() => handleMobileNav('DoctorPortal')} className="block w-full text-left py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">My Portal</button>}
                {currentUser.role === 'user' && <button onClick={() => handleMobileNav('UserDashboard')} className="block w-full text-left py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">My Account</button>}
                <button onClick={() => {handleLogout(); setIsMobileMenuOpen(false);}} className="bg-red-500 text-white w-full mt-2 px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition duration-300">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => handleMobileNav('Login')} className="block w-full text-left py-2 text-gray-600 hover:bg-amber-50 hover:text-yellow-600">Login</button>
                <button onClick={() => handleMobileNav('SignUp')} className="bg-green-600 text-white w-full mt-2 px-6 py-2 rounded-full font-semibold hover:bg-yellow-700 transition duration-300">Sign Up</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
