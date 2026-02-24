// src/App.js - Enhanced Nirmaya Health Services
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  HeartPulse, Stethoscope, Calendar, Users, Activity, FileText, MessageSquare,
  Settings, LogOut, LogIn, UserPlus, Home, Info, Phone, Menu, X, ChevronDown,
  Search, Bell, Shield, Clock, Star, Send, Bot, Package, Clipboard, BarChart3,
  User, Lock, Mail, Eye, EyeOff, Check, AlertCircle, Trash2, Edit, Plus,
  Hospital, Ambulance, BookOpen, Video, ShieldCheck, Upload, Download, Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api, setAccessToken } from './services/apiClient';

// Context for global state
const AppContext = React.createContext();

// Toast Notification Component
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
    {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2"><X size={18} /></button>
  </div>
);

// Loading Spinner
const Spinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
  </div>
);

// Navbar Component
const Navbar = ({ user, onLogout, navigateTo, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);

  const departments = ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Ophthalmology'];
  const services = [
    { name: 'Find a Doctor', page: 'doctors' },
    { name: 'Book Appointment', page: 'appointments' },
    { name: 'Health Checkup', page: 'health-check' },
    { name: 'Equipment', page: 'equipment' },
    { name: 'Ambulance', page: 'ambulance' },
  ];

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')}>
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-2 rounded-lg">
            <img src="/logo192.png" alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Nirmaya Health</h1>
            <p className="text-xs text-teal-600">Smart Hospital Services</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <button onClick={() => navigateTo('home')} className={`font-medium transition ${currentPage === 'home' ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'}`}>Home</button>
          <button onClick={() => navigateTo('about')} className={`font-medium transition ${currentPage === 'about' ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'}`}>About</button>
          
          {/* Departments Dropdown */}
          <div className="relative">
            <button onClick={() => setDepartmentsOpen(!departmentsOpen)} className="flex items-center gap-1 font-medium text-gray-600 hover:text-teal-600">
              Departments <ChevronDown size={16} className={`transition ${departmentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {departmentsOpen && (
              <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                {departments.map(dept => (
                  <button key={dept} onClick={() => { navigateTo('doctors', { department: dept }); setDepartmentsOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600">{dept}</button>
                ))}
              </div>
            )}
          </div>

          {/* Services Dropdown */}
          <div className="relative">
            <button onClick={() => setServicesOpen(!servicesOpen)} className="flex items-center gap-1 font-medium text-gray-600 hover:text-teal-600">
              Services <ChevronDown size={16} className={`transition ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {servicesOpen && (
              <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                {services.map(s => (
                  <button key={s.page} onClick={() => { navigateTo(s.page); setServicesOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600">{s.name}</button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'admin' && <button onClick={() => navigateTo('admin')} className="text-teal-600 font-medium hover:text-teal-700">Admin</button>}
              {user.role === 'doctor' && <button onClick={() => navigateTo('doctor-portal')} className="text-teal-600 font-medium hover:text-teal-700">My Portal</button>}
              {user.role === 'patient' && <button onClick={() => navigateTo('dashboard')} className="text-teal-600 font-medium hover:text-teal-700">Dashboard</button>}
              <button onClick={() => navigateTo('messages')} className="relative p-2 text-gray-600 hover:text-teal-600">
                <MessageSquare size={20} />
              </button>
              <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigateTo('login')} className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium">
                <LogIn size={18} /> Login
              </button>
              <button onClick={() => navigateTo('register')} className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition">
                <UserPlus size={18} /> Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t py-4 px-4">
          <button onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Home</button>
          <button onClick={() => { navigateTo('about'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">About</button>
          <button onClick={() => { navigateTo('doctors'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Find Doctors</button>
          <button onClick={() => { navigateTo('appointments'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Appointments</button>
          <button onClick={() => { navigateTo('equipment'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Equipment</button>
          {user ? (
            <>
              <button onClick={() => { navigateTo('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-teal-600">Dashboard</button>
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-red-500">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { navigateTo('login'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-teal-600">Login</button>
              <button onClick={() => { navigateTo('register'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-teal-600">Sign Up</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

// Footer Component
const Footer = ({ navigateTo }) => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="text-teal-400" size={28} />
            <span className="text-xl font-bold">Nirmaya Health</span>
          </div>
          <p className="text-gray-400">Providing compassionate, world-class healthcare with modern technology.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <div className="space-y-2">
            <button onClick={() => navigateTo('doctors')} className="block text-gray-400 hover:text-teal-400">Find Doctors</button>
            <button onClick={() => navigateTo('appointments')} className="block text-gray-400 hover:text-teal-400">Appointments</button>
            <button onClick={() => navigateTo('equipment')} className="block text-gray-400 hover:text-teal-400">Equipment</button>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Services</h4>
          <div className="space-y-2">
            <button onClick={() => navigateTo('health-check')} className="block text-gray-400 hover:text-teal-400">Health Checkup</button>
            <button onClick={() => navigateTo('reports')} className="block text-gray-400 hover:text-teal-400">Medical Reports</button>
            <button onClick={() => navigateTo('ambulance')} className="block text-gray-400 hover:text-teal-400">Ambulance</button>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <p className="text-gray-400">123 Healthcare Avenue<br />Kolkata, WB 700001</p>
          <p className="text-gray-400 mt-2">contact@nirmaya.com<br />+91 8617422754</p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Nirmaya Health Services. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

// Home Page
const HomePage = ({ navigateTo, user }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200', caption: 'World-Class Healthcare at Your Fingertips' },
    { image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200', caption: 'Advanced Technology for Better Outcomes' },
    { image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200', caption: 'Expert Doctors, Compassionate Care' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const services = [
    { icon: <Stethoscope size={40} />, title: 'Find a Doctor', desc: 'Browse our expert physicians', page: 'doctors' },
    { icon: <Calendar size={40} />, title: 'Book Appointment', desc: 'Schedule your visit online', page: 'appointments' },
    { icon: <Video size={40} />, title: 'Online Consultation', desc: 'Consult from anywhere', page: 'appointments' },
    { icon: <Ambulance size={40} />, title: 'Emergency Services', desc: '24/7 ambulance support', page: 'ambulance' },
    { icon: <Shield size={40} />, title: 'Health Checkup', desc: 'Comprehensive packages', page: 'health-check' },
    { icon: <Package size={40} />, title: 'Modern Equipment', desc: 'State-of-the-art facilities', page: 'equipment' },
  ];

  const stats = [
    { number: '50+', label: 'Expert Doctors' },
    { number: '100K+', label: 'Patients Served' },
    { number: '15+', label: 'Departments' },
    { number: '24/7', label: 'Emergency Care' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-transparent" />
          </div>
        ))}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl font-bold mb-6 animate-fade-in">{slides[currentSlide].caption}</h1>
              <p className="text-xl mb-8 text-gray-200">Experience healthcare reimagined with cutting-edge technology and compassionate care.</p>
              <div className="flex gap-4">
                <button onClick={() => navigateTo('appointments')} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg">
                  Book Appointment
                </button>
                <button onClick={() => navigateTo('doctors')} className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-teal-600 transition">
                  Find Doctors
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition ${i === currentSlide ? 'bg-teal-400' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-teal-500 to-emerald-500 py-12 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-teal-600">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive healthcare services designed for your well-being</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} onClick={() => navigateTo(service.page)} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer group">
                <div className="text-teal-500 mb-4 group-hover:scale-110 transition">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img src="https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600" alt="Healthcare" className="rounded-2xl shadow-xl" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Why Choose Nirmaya Health?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-teal-100 p-3 rounded-lg h-fit"><ShieldCheck className="text-teal-600" /></div>
                  <div>
                    <h4 className="font-semibold text-lg">Expert Medical Team</h4>
                    <p className="text-gray-600">Board-certified doctors with decades of experience</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-teal-100 p-3 rounded-lg h-fit"><Activity className="text-teal-600" /></div>
                  <div>
                    <h4 className="font-semibold text-lg">Advanced Technology</h4>
                    <p className="text-gray-600">State-of-the-art medical equipment and facilities</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-teal-100 p-3 rounded-lg h-fit"><HeartPulse className="text-teal-600" /></div>
                  <div>
                    <h4 className="font-semibold text-lg">Patient-Centric Care</h4>
                    <p className="text-gray-600">Your comfort and well-being is our priority</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Login Page
const LoginPage = ({ onLogin, navigateTo, showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      setAccessToken(data.token);
      onLogin(data.user);
      showToast('Login successful!', 'success');
      navigateTo('home');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 rounded-full w-fit mx-auto mb-4">
            <HeartPulse className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="your@email.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account? <button onClick={() => navigateTo('register')} className="text-teal-600 font-semibold hover:underline">Sign Up</button>
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold">Demo Accounts:</p>
          <p>Admin: admin@nirmaya.com / admin123</p>
          <p>Doctor: ananya@nirmaya.com / doctor123</p>
        </div>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onLogin, navigateTo, showToast }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/register', form);
      setAccessToken(data.token);
      onLogin(data.user);
      showToast('Registration successful!', 'success');
      navigateTo('home');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 rounded-full w-fit mx-auto mb-4">
            <UserPlus className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600">Join Nirmaya Health today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="John Doe" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="your@email.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="+91 9876543210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="••••••••" required minLength={6} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account? <button onClick={() => navigateTo('login')} className="text-teal-600 font-semibold hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
};

// Doctors Page
const DoctorsPage = ({ navigateTo, showToast }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, [department]);

  const loadDoctors = async () => {
    try {
      const data = await api.get(`/doctors${department ? `?department=${department}` : ''}`);
      setDoctors(data);
    } catch (err) {
      showToast('Failed to load doctors', 'error');
    }
    setLoading(false);
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const departments = ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Dermatology'];

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Expert Doctors</h1>
          <p className="text-gray-600">Find and book appointments with our specialists</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <img src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name}&size=400`} alt={doctor.name} className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                <p className="text-teal-600 font-medium">{doctor.specialty}</p>
                <p className="text-gray-500 text-sm mt-1">{doctor.department} • {doctor.experience}</p>
                {doctor.average_rating > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="text-gray-600">{doctor.average_rating} ({doctor.review_count} reviews)</span>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setSelectedDoctor(doctor)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">View Profile</button>
                  <button onClick={() => navigateTo('appointments', { doctorId: doctor.id })} className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition">Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No doctors found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoctor(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedDoctor.image || `https://ui-avatars.com/api/?name=${selectedDoctor.name}&size=400`} alt={selectedDoctor.name} className="w-full h-72 object-cover" />
              <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800">{selectedDoctor.name}</h2>
              <p className="text-teal-600 text-lg font-medium">{selectedDoctor.specialty}</p>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <span>{selectedDoctor.department}</span>
                <span>•</span>
                <span>{selectedDoctor.experience}</span>
                {selectedDoctor.consultation_fee && (
                  <><span>•</span><span>₹{selectedDoctor.consultation_fee}</span></>
                )}
              </div>
              {selectedDoctor.average_rating > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={20} className={i <= selectedDoctor.average_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                  <span className="text-gray-600">({selectedDoctor.review_count} reviews)</span>
                </div>
              )}
              {selectedDoctor.qualifications && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800">Qualifications</h4>
                  <p className="text-gray-600">{selectedDoctor.qualifications}</p>
                </div>
              )}
              {selectedDoctor.certifications?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800">Certifications</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDoctor.certifications.map((cert, i) => (
                      <span key={i} className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">{cert}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedDoctor.bio && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800">About</h4>
                  <p className="text-gray-600">{selectedDoctor.bio}</p>
                </div>
              )}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">Available Time Slots</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.time_slots?.map((slot, i) => (
                    <span key={i} className="bg-gray-100 px-3 py-1 rounded-lg text-gray-700">{slot}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => { setSelectedDoctor(null); navigateTo('appointments', { doctorId: selectedDoctor.id }); }} className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition">
                  Book Appointment
                </button>
                <button onClick={() => { setSelectedDoctor(null); navigateTo('messages', { userId: selectedDoctor.id }); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <MessageSquare size={20} /> Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Appointments Page
const AppointmentsPage = ({ user, navigateTo, showToast, pageParams }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    doctor_id: pageParams?.doctorId || '',
    date: '',
    time: '',
    reason: '',
    appointment_type: 'Consultation'
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await api.get('/doctors');
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const selectedDoctor = doctors.find(d => d.id === form.doctor_id);

  const handleSubmit = async () => {
    if (!user) {
      showToast('Please login to book an appointment', 'error');
      navigateTo('login');
      return;
    }
    try {
      await api.post('/appointments', form);
      showToast('Appointment booked successfully!', 'success');
      navigateTo('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Book an Appointment</h1>
          <p className="text-gray-600">Schedule your visit with our expert doctors</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{s}</div>
              {s < 3 && <div className={`w-20 h-1 ${step > s ? 'bg-teal-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Select Doctor */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Select a Doctor</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {doctors.map(doctor => (
                  <div key={doctor.id} onClick={() => setForm({...form, doctor_id: doctor.id})} className={`p-4 border rounded-xl cursor-pointer transition ${form.doctor_id === doctor.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                    <div className="flex items-center gap-4">
                      <img src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name}`} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                      <div>
                        <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
                        <p className="text-teal-600">{doctor.specialty}</p>
                        <p className="text-gray-500 text-sm">{doctor.department}</p>
                      </div>
                      {form.doctor_id === doctor.id && <Check className="ml-auto text-teal-500" size={24} />}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} disabled={!form.doctor_id} className="w-full mt-6 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && selectedDoctor && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Select Date & Time</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                  <select value={form.appointment_type} onChange={e => setForm({...form, appointment_type: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Online">Online Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedDoctor.time_slots?.map(slot => (
                      <button key={slot} onClick={() => setForm({...form, time: slot})} className={`p-3 rounded-lg border transition ${form.time === slot ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-300 hover:border-teal-500'}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                  <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Briefly describe your symptoms or reason..." className="w-full p-3 border border-gray-300 rounded-lg h-24" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Back</button>
                <button onClick={() => setStep(3)} disabled={!form.date || !form.time} className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition disabled:opacity-50">Continue</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedDoctor && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Confirm Appointment</h3>
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-4">
                  <img src={selectedDoctor.image || `https://ui-avatars.com/api/?name=${selectedDoctor.name}`} alt={selectedDoctor.name} className="w-20 h-20 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-xl">{selectedDoctor.name}</h4>
                    <p className="text-teal-600">{selectedDoctor.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div><span className="text-gray-500">Type:</span> <span className="font-medium">{form.appointment_type}</span></div>
                  <div><span className="text-gray-500">Fee:</span> <span className="font-medium">₹{selectedDoctor.consultation_fee || 500}</span></div>
                  <div><span className="text-gray-500">Date:</span> <span className="font-medium">{form.date}</span></div>
                  <div><span className="text-gray-500">Time:</span> <span className="font-medium">{form.time}</span></div>
                </div>
                {form.reason && <div className="pt-4 border-t"><span className="text-gray-500">Reason:</span> <p className="mt-1">{form.reason}</p></div>}
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Back</button>
                <button onClick={handleSubmit} className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition">Confirm Booking</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Equipment Page
const EquipmentPage = ({ showToast }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const data = await api.get('/equipment');
      setEquipment(data);
    } catch (err) {
      showToast('Failed to load equipment', 'error');
    }
    setLoading(false);
  };

  const categories = [...new Set(equipment.map(e => e.category))];
  const filtered = category ? equipment.filter(e => e.category === category) : equipment;

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Modern Medical Equipment</h1>
          <p className="text-gray-600">State-of-the-art technology for accurate diagnosis and treatment</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button onClick={() => setCategory('')} className={`px-6 py-2 rounded-full transition ${!category ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`}>All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-2 rounded-full transition ${category === cat ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`}>{cat}</button>
          ))}
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="relative">
                <img src={item.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400'} alt={item.name} className="w-full h-48 object-cover" />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${item.status === 'Available' ? 'bg-green-100 text-green-700' : item.status === 'In Use' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {item.status}
                </span>
              </div>
              <div className="p-6">
                <span className="text-teal-600 text-sm font-medium">{item.category}</span>
                <h3 className="text-xl font-bold text-gray-800 mt-1">{item.name}</h3>
                <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
                <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-500">
                  <span>{item.manufacturer}</span>
                  <span>{item.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No equipment found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the main App (continued in next file)
export { api, Toast, Spinner, Navbar, Footer, HomePage, LoginPage, RegisterPage, DoctorsPage, AppointmentsPage, EquipmentPage };
