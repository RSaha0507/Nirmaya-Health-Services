// src/MainApp.js - Complete Enhanced Nirmaya Health Services Application
import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse, Stethoscope, Calendar, Users, Activity, FileText, MessageSquare,
  Settings, LogOut, LogIn, UserPlus, Home, Info, Phone, Menu, X, ChevronDown,
  Search, Bell, Shield, Clock, Star, Send, Bot, Package, Clipboard, BarChart3,
  User, Lock, Mail, Eye, EyeOff, Check, AlertCircle, Trash2, Edit, Plus,
  Hospital, Ambulance, BookOpen, Video, ShieldCheck, Upload, Download, Filter,
  ChevronLeft, ChevronRight, TrendingUp, DollarSign, UserCheck, FileCheck,
  RefreshCw, MoreVertical, Image, Building2, Bed, TestTube
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
  DepartmentsPage,
  HealthPackagesPage,
  BedAvailabilityPage,
  LabTestsPage,
  AmbulanceServicePage,
  InventoryPage,
  PaymentSuccessPage,
  PaymentCancelPage
} from './AdditionalPages';
import './App.css';
import {
  api,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getCachedUserProfile,
  setCachedUserProfile,
  clearCachedUserProfile,
  openExternalUrlSafely,
  buildWebSocketUrl
} from './services/apiClient';

const normalizeRole = (role = '') => {
  const normalized = String(role).toLowerCase();
  if (normalized === 'hospital_admin') return 'hospital_administrator';
  return normalized;
};

const hasRole = (user, roles) => {
  const currentRole = normalizeRole(user?.role);
  return roles.map(normalizeRole).includes(currentRole);
};

const getPrimaryDashboardRoute = (user) => {
  if (!user) return 'home';
  if (hasRole(user, ['admin', 'hospital_administrator', 'staff', 'nurse'])) return 'operations';
  if (hasRole(user, ['doctor'])) return 'doctor-portal';
  return 'dashboard';
};

const PAGE_PATHS = {
  home: '/',
  about: '/about',
  login: '/login',
  register: '/register',
  doctors: '/doctors',
  appointments: '/appointments',
  equipment: '/equipment',
  dashboard: '/dashboard',
  'doctor-portal': '/doctor-portal',
  admin: '/admin',
  operations: '/operations',
  profile: '/profile',
  messages: '/messages',
  reports: '/reports',
  departments: '/departments',
  'health-packages': '/health-packages',
  beds: '/beds',
  'lab-tests': '/lab-tests',
  ambulance: '/ambulance',
  inventory: '/inventory',
  'payment-success': '/payment-success',
  'payment-cancel': '/payment-cancel'
};

const PATH_TO_PAGE = Object.entries(PAGE_PATHS).reduce((map, [page, path]) => {
  map[path] = page;
  return map;
}, {});

const getRouteFromLocation = () => {
  const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
  const page = PATH_TO_PAGE[path] || 'home';
  const search = new URLSearchParams(window.location.search || '');
  const params = {};

  const department = search.get('department');
  if (department) params.department = department;
  const doctorId = search.get('doctorId');
  if (doctorId) params.doctorId = doctorId;
  const chatWith = search.get('chatWith');
  if (chatWith) params.chatWith = chatWith;
  if (page === 'home' && search.get('session_id')) {
    return { page: 'payment-success', params };
  }

  return { page, params };
};

const buildRouteUrl = (page, params = {}) => {
  const path = PAGE_PATHS[page] || '/';
  const search = new URLSearchParams();
  if (params.department) search.set('department', params.department);
  if (params.doctorId) search.set('doctorId', params.doctorId);
  if (params.chatWith) search.set('chatWith', params.chatWith);
  const query = search.toString();
  return query ? `${path}?${query}` : path;
};

// Toast Component
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
    {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2"><X size={18} /></button>
  </div>
);

// Spinner
const Spinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
  </div>
);

// Navbar
const Navbar = ({ user, onLogout, navigateTo, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const departments = ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Dermatology'];
  const canManageOperations = hasRole(user, ['admin', 'hospital_administrator', 'staff', 'nurse']);
  const isDoctor = hasRole(user, ['doctor']);
  const isPatient = hasRole(user, ['patient']);

  const services = [
    { name: 'Find a Doctor', page: 'doctors', icon: Stethoscope },
    { name: 'Departments', page: 'departments', icon: Building2 },
    { name: 'Book Appointment', page: 'appointments', icon: Calendar },
    { name: 'Health Packages', page: 'health-packages', icon: Package },
    { name: 'Lab Tests', page: 'lab-tests', icon: TestTube },
    { name: 'Bed Availability', page: 'beds', icon: Bed },
    { name: 'Ambulance', page: 'ambulance', icon: Ambulance },
    { name: 'Equipment', page: 'equipment', icon: Hospital },
    { name: 'Medical Reports', page: 'reports', icon: FileText },
  ];
  if (canManageOperations) {
    services.push({ name: 'Inventory', page: 'inventory', icon: Package });
  }

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50" data-testid="navbar">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')} data-testid="logo">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-2 rounded-lg">
            <HeartPulse className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Nirmaya Health</h1>
            <p className="text-xs text-teal-600">Smart Hospital Services</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          <button onClick={() => navigateTo('home')} className={`font-medium transition ${currentPage === 'home' ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'}`} data-testid="nav-home">Home</button>
          <button onClick={() => navigateTo('about')} className={`font-medium transition ${currentPage === 'about' ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'}`} data-testid="nav-about">About</button>
          <button onClick={() => navigateTo('doctors')} className={`font-medium transition ${currentPage === 'doctors' ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'}`} data-testid="nav-doctors">Doctors</button>
          <div className="relative">
            <button onClick={() => setServicesOpen(!servicesOpen)} className="flex items-center gap-1 font-medium text-gray-600 hover:text-teal-600" data-testid="nav-services">
              Services <ChevronDown size={16} className={`transition ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {servicesOpen && (
              <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20">
                {services.map(s => (
                  <button key={s.page} onClick={() => { navigateTo(s.page); setServicesOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600">
                    <s.icon size={16} /> {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => navigateTo('equipment')} className={`font-medium transition ${currentPage === 'equipment' ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'}`} data-testid="nav-equipment">Equipment</button>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              {hasRole(user, ['admin']) && <button onClick={() => navigateTo('admin')} className="text-teal-600 font-medium hover:text-teal-700" data-testid="nav-admin">Admin</button>}
              {canManageOperations && <button onClick={() => navigateTo('operations')} className="text-teal-600 font-medium hover:text-teal-700" data-testid="nav-operations">Operations</button>}
              {isDoctor && <button onClick={() => navigateTo('doctor-portal')} className="text-teal-600 font-medium hover:text-teal-700" data-testid="nav-portal">My Portal</button>}
              {isPatient && <button onClick={() => navigateTo('dashboard')} className="text-teal-600 font-medium hover:text-teal-700" data-testid="nav-dashboard">Dashboard</button>}
              <button onClick={() => navigateTo('profile')} className="text-gray-600 hover:text-teal-600 font-medium" data-testid="nav-profile">Profile</button>
              <button onClick={() => navigateTo('messages')} className="relative p-2 text-gray-600 hover:text-teal-600" data-testid="nav-messages">
                <MessageSquare size={20} />
              </button>
              <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition" data-testid="logout-btn">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigateTo('login')} className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium" data-testid="login-btn">
                <LogIn size={18} /> Login
              </button>
              <button onClick={() => navigateTo('register')} className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition" data-testid="signup-btn">
                <UserPlus size={18} /> Sign Up
              </button>
            </>
          )}
        </div>

        <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-btn">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t py-4 px-4">
          <button onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Home</button>
          <button onClick={() => { navigateTo('doctors'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Doctors</button>
          <button onClick={() => { navigateTo('appointments'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Appointments</button>
          <button onClick={() => { navigateTo('equipment'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Equipment</button>
          {user ? (
            <>
              <button
                onClick={() => { navigateTo(getPrimaryDashboardRoute(user)); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-teal-600"
              >
                {canManageOperations ? 'Operations' : isDoctor ? 'My Portal' : 'Dashboard'}
              </button>
              <button onClick={() => { navigateTo('profile'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Profile</button>
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

// Footer
const Footer = ({ navigateTo }) => (
  <footer className="bg-gray-900 text-white py-12" data-testid="footer">
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
            <button onClick={() => navigateTo('reports')} className="block text-gray-400 hover:text-teal-400">Medical Reports</button>
            <button onClick={() => navigateTo('messages')} className="block text-gray-400 hover:text-teal-400">Chat with Doctors</button>
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
const HomePage = ({ navigateTo }) => {
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
    { icon: <MessageSquare size={40} />, title: 'Chat with Doctors', desc: 'Real-time consultation', page: 'messages' },
    { icon: <FileText size={40} />, title: 'Medical Reports', desc: 'View your reports online', page: 'reports' },
    { icon: <Package size={40} />, title: 'Modern Equipment', desc: 'State-of-the-art facilities', page: 'equipment' },
    { icon: <BarChart3 size={40} />, title: 'Health Analytics', desc: 'Track your health journey', page: 'dashboard' },
  ];

  const stats = [
    { number: '50+', label: 'Expert Doctors' },
    { number: '100K+', label: 'Patients Served' },
    { number: '15+', label: 'Departments' },
    { number: '24/7', label: 'Emergency Care' },
  ];

  return (
    <div data-testid="home-page">
      {/* Hero */}
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
              <h1 className="text-5xl font-bold mb-6">{slides[currentSlide].caption}</h1>
              <p className="text-xl mb-8 text-gray-200">Experience healthcare reimagined with cutting-edge technology and compassionate care.</p>
              <div className="flex gap-4">
                <button onClick={() => navigateTo('appointments')} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg" data-testid="hero-book-btn">
                  Book Appointment
                </button>
                <button onClick={() => navigateTo('doctors')} className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-teal-600 transition" data-testid="hero-doctors-btn">
                  Find Doctors
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition ${i === currentSlide ? 'bg-teal-400' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* Stats */}
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

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive healthcare services designed for your well-being</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} onClick={() => navigateTo(service.page)} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer group card-hover" data-testid={`service-${service.page}`}>
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
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center py-20 px-4" data-testid="login-page">
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
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="your@email.com" required data-testid="email-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="••••••••" required data-testid="password-input" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50" data-testid="submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account? <button onClick={() => navigateTo('register')} className="text-teal-600 font-semibold hover:underline" data-testid="register-link">Sign Up</button>
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
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center py-20 px-4" data-testid="register-page">
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
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="John Doe" required data-testid="name-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="your@email.com" required data-testid="email-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="+91 9876543210" data-testid="phone-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="••••••••" required minLength={6} data-testid="password-input" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50" data-testid="submit-btn">
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
const DoctorsPage = ({ navigateTo, showToast, pageParams }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState(pageParams?.department || '');
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
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="doctors-page">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Expert Doctors</h1>
          <p className="text-gray-600">Find and book appointments with our specialists</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" data-testid="search-input" />
            </div>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" data-testid="department-filter">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition card-hover" data-testid={`doctor-card-${doctor.id}`}>
              <img src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name}&size=400&background=14b8a6&color=fff`} alt={doctor.name} className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                <p className="text-teal-600 font-medium">{doctor.specialty}</p>
                <p className="text-gray-500 text-sm mt-1">{doctor.department} • {doctor.experience}</p>
                {doctor.average_rating > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="text-gray-600">{doctor.average_rating}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setSelectedDoctor(doctor)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition" data-testid={`view-profile-${doctor.id}`}>View Profile</button>
                  <button onClick={() => navigateTo('appointments', { doctorId: doctor.id })} className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition" data-testid={`book-btn-${doctor.id}`}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No doctors found</p>
          </div>
        )}
      </div>

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
              {selectedDoctor.qualifications && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800">Qualifications</h4>
                  <p className="text-gray-600">{selectedDoctor.qualifications}</p>
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
                <button onClick={() => { setSelectedDoctor(null); navigateTo('messages', { chatWith: selectedDoctor.id }); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2">
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
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="appointments-page">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Book an Appointment</h1>
          <p className="text-gray-600">Schedule your visit with our expert doctors</p>
        </div>

        <div className="flex justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{s}</div>
              {s < 3 && <div className={`w-20 h-1 ${step > s ? 'bg-teal-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Select a Doctor</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {doctors.map(doctor => (
                  <div key={doctor.id} onClick={() => setForm({...form, doctor_id: doctor.id})} className={`p-4 border rounded-xl cursor-pointer transition ${form.doctor_id === doctor.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`} data-testid={`select-doctor-${doctor.id}`}>
                    <div className="flex items-center gap-4">
                      <img src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name}`} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
                        <p className="text-teal-600">{doctor.specialty}</p>
                        <p className="text-gray-500 text-sm">{doctor.department}</p>
                      </div>
                      {form.doctor_id === doctor.id && <Check className="text-teal-500" size={24} />}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} disabled={!form.doctor_id} className="w-full mt-6 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition disabled:opacity-50" data-testid="continue-step1">
                Continue
              </button>
            </div>
          )}

          {step === 2 && selectedDoctor && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Select Date & Time</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                  <select value={form.appointment_type} onChange={e => setForm({...form, appointment_type: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" data-testid="appointment-type">
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Online">Online Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-gray-300 rounded-lg" data-testid="date-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedDoctor.time_slots?.map(slot => (
                      <button key={slot} type="button" onClick={() => setForm({...form, time: slot})} className={`p-3 rounded-lg border transition ${form.time === slot ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-300 hover:border-teal-500'}`} data-testid={`time-slot-${slot}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                  <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Briefly describe your symptoms..." className="w-full p-3 border border-gray-300 rounded-lg h-24" data-testid="reason-input" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Back</button>
                <button onClick={() => setStep(3)} disabled={!form.date || !form.time} className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition disabled:opacity-50" data-testid="continue-step2">Continue</button>
              </div>
            </div>
          )}

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
                <button onClick={handleSubmit} className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition" data-testid="confirm-booking">Confirm Booking</button>
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
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="equipment-page">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Modern Medical Equipment</h1>
          <p className="text-gray-600">State-of-the-art technology for accurate diagnosis and treatment</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button onClick={() => setCategory('')} className={`px-6 py-2 rounded-full transition ${!category ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`} data-testid="filter-all">All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-2 rounded-full transition ${category === cat ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`} data-testid={`filter-${cat}`}>{cat}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition card-hover" data-testid={`equipment-${item.id}`}>
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

// Patient Dashboard
const PatientDashboard = ({ user, navigateTo, showToast }) => {
  const [analytics, setAnalytics] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, appointmentsData, reportsData] = await Promise.all([
        api.get('/analytics/patient'),
        api.get('/appointments'),
        api.get('/reports')
      ]);
      setAnalytics(analyticsData);
      setAppointments(appointmentsData);
      setReports(reportsData);
    } catch (err) {
      showToast('Failed to load dashboard', 'error');
    }
    setLoading(false);
  };

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="patient-dashboard">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Track your health journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.total_appointments || 0}</p>
              </div>
              <Calendar className="text-teal-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Upcoming</p>
                <p className="text-3xl font-bold text-teal-600">{analytics?.upcoming_appointments || 0}</p>
              </div>
              <Clock className="text-teal-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Medical Reports</p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.total_reports || 0}</p>
              </div>
              <FileText className="text-teal-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Doctors Visited</p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.health_summary?.doctors_visited || 0}</p>
              </div>
              <Stethoscope className="text-teal-500" size={40} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
              <button onClick={() => navigateTo('appointments')} className="text-teal-600 hover:text-teal-700 font-medium">Book New</button>
            </div>
            <div className="space-y-4">
              {appointments.slice(0, 5).map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{apt.doctor_name}</p>
                    <p className="text-sm text-gray-500">{apt.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{apt.date}</p>
                    <p className="text-sm text-gray-500">{apt.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'scheduled' ? 'bg-teal-100 text-teal-700' : apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
              {appointments.length === 0 && <p className="text-gray-500 text-center py-4">No appointments yet</p>}
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Medical Reports</h2>
              <button onClick={() => navigateTo('reports')} className="text-teal-600 hover:text-teal-700 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {reports.slice(0, 5).map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="text-teal-500" size={24} />
                    <div>
                      <p className="font-semibold">{report.report_name}</p>
                      <p className="text-sm text-gray-500">{report.report_type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!openExternalUrlSafely(report.file_url)) {
                        showToast('Unable to open report link', 'error');
                      }
                    }}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <Download size={20} />
                  </button>
                </div>
              ))}
              {reports.length === 0 && <p className="text-gray-500 text-center py-4">No reports yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Doctor Portal
const DoctorPortal = ({ user, navigateTo, showToast }) => {
  const [analytics, setAnalytics] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, appointmentsData] = await Promise.all([
        api.get('/analytics/doctor'),
        api.get('/appointments')
      ]);
      setAnalytics(analyticsData);
      setAppointments(appointmentsData);
    } catch (err) {
      showToast('Failed to load portal', 'error');
    }
    setLoading(false);
  };

  const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const weeklyData = analytics?.weekly_appointments ? Object.entries(analytics.weekly_appointments).map(([date, count]) => ({ date: date.slice(5), count })) : [];

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="doctor-portal">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Your practice dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.unique_patients || 0}</p>
              </div>
              <Users className="text-teal-500" size={36} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Today's Appointments</p>
                <p className="text-3xl font-bold text-teal-600">{analytics?.scheduled_appointments || 0}</p>
              </div>
              <Calendar className="text-teal-500" size={36} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-green-600">{analytics?.completed_appointments || 0}</p>
              </div>
              <Check className="text-green-500" size={36} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics?.average_rating || 0}</p>
              </div>
              <Star className="text-yellow-500" size={36} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.completion_rate || 0}%</p>
              </div>
              <TrendingUp className="text-teal-500" size={36} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Appointments</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Today's Schedule</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="text-teal-500" size={20} />
                    <div>
                      <p className="font-semibold">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">{apt.reason || 'Consultation'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{apt.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${apt.status === 'scheduled' ? 'bg-teal-100 text-teal-700' : 'bg-green-100 text-green-700'}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
              {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <p className="text-gray-500 text-center py-4">No appointments today</p>
              )}
            </div>
          </div>
        </div>

        {/* All Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">All Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td className="px-4 py-3">{apt.patient_name}</td>
                    <td className="px-4 py-3">{apt.date}</td>
                    <td className="px-4 py-3">{apt.time}</td>
                    <td className="px-4 py-3">{apt.appointment_type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'scheduled' ? 'bg-teal-100 text-teal-700' : apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigateTo('messages', { chatWith: apt.patient_id })} className="text-teal-600 hover:text-teal-700">
                        <MessageSquare size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ showToast, navigateTo }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, doctorsData, usersData, appointmentsData] = await Promise.all([
        api.get('/analytics/admin'),
        api.get('/doctors'),
        api.get('/users'),
        api.get('/appointments')
      ]);
      setAnalytics(analyticsData);
      setDoctors(doctorsData);
      setUsers(usersData);
      setAppointments(appointmentsData);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    }
    setLoading(false);
  };

  const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const deptData = analytics?.appointments_by_department ? Object.entries(analytics.appointments_by_department).map(([name, value]) => ({ name, value })) : [];

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="admin-dashboard">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Hospital management overview</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.total_users || 0}</p>
              </div>
              <Users className="text-teal-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Doctors</p>
                <p className="text-3xl font-bold text-teal-600">{analytics?.total_doctors || 0}</p>
              </div>
              <Stethoscope className="text-teal-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.total_appointments || 0}</p>
              </div>
              <Calendar className="text-teal-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Medical Reports</p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.total_reports || 0}</p>
              </div>
              <FileText className="text-teal-500" size={40} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['overview', 'doctors', 'users', 'appointments'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Appointments by Department</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Registrations</h2>
              <div className="space-y-4">
                {analytics?.recent_registrations?.map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <p className="text-sm text-gray-500">{new Date(user.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Doctors</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Specialty</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Experience</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {doctors.map(doc => (
                    <tr key={doc.id}>
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={doc.image || `https://ui-avatars.com/api/?name=${doc.name}`} alt={doc.name} className="w-10 h-10 rounded-full" />
                        {doc.name}
                      </td>
                      <td className="px-4 py-3">{doc.specialty}</td>
                      <td className="px-4 py-3">{doc.department}</td>
                      <td className="px-4 py-3">{doc.experience}</td>
                      <td className="px-4 py-3">
                        <button className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.role !== 'admin' && <button className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">All Appointments</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Doctor</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td className="px-4 py-3">{apt.patient_name}</td>
                      <td className="px-4 py-3">{apt.doctor_name}</td>
                      <td className="px-4 py-3">{apt.date}</td>
                      <td className="px-4 py-3">{apt.time}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'scheduled' ? 'bg-teal-100 text-teal-700' : apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Operations Dashboard
const OperationsDashboard = ({ user, navigateTo, showToast }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.get('/analytics/operations');
      setAnalytics(data);
    } catch (err) {
      showToast('Failed to load operations data', 'error');
    }
    setLoading(false);
  };

  if (loading) return <div className="pt-24"><Spinner /></div>;

  const cards = [
    { label: 'Assigned Patients', value: analytics?.assigned_patients || 0, icon: UserCheck },
    { label: 'Active Patients', value: analytics?.active_patients || 0, icon: Users },
    { label: 'Today Appointments', value: analytics?.today_appointments || 0, icon: Calendar },
    { label: 'Available Beds', value: analytics?.available_beds || 0, icon: Bed },
    { label: 'Total Doctors', value: analytics?.total_doctors || 0, icon: Stethoscope },
    { label: 'Departments', value: analytics?.total_departments || 0, icon: Building2 },
  ];

  return (
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="operations-dashboard">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Operations Dashboard</h1>
          <p className="text-gray-600">Hello, {user?.name}. Monitor core hospital operations in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                </div>
                <card.icon className="text-teal-500" size={34} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => navigateTo('beds')} className="bg-teal-500 text-white px-4 py-3 rounded-lg hover:bg-teal-600 transition">
              Manage Beds
            </button>
            <button onClick={() => navigateTo('inventory')} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition">
              View Inventory
            </button>
            <button onClick={() => navigateTo('reports')} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition">
              Medical Reports
            </button>
            <button onClick={() => navigateTo('departments')} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition">
              Departments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = ({ user, onUserUpdate, showToast }) => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    blood_group: '',
    emergency_contact: '',
    allergies: '',
    chronic_conditions: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.get('/auth/me');
      setProfile(data);
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        date_of_birth: data.date_of_birth || '',
        blood_group: data.blood_group || '',
        emergency_contact: data.emergency_contact || '',
        allergies: Array.isArray(data.allergies) ? data.allergies.join(', ') : '',
        chronic_conditions: Array.isArray(data.chronic_conditions) ? data.chronic_conditions.join(', ') : '',
      });
    } catch (err) {
      showToast('Failed to load profile', 'error');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
      };

      if (!hasRole(user, ['doctor'])) {
        payload.address = form.address || null;
        payload.date_of_birth = form.date_of_birth || null;
        payload.blood_group = form.blood_group || null;
        payload.emergency_contact = form.emergency_contact || null;
        payload.allergies = form.allergies ? form.allergies.split(',').map(item => item.trim()).filter(Boolean) : [];
        payload.chronic_conditions = form.chronic_conditions ? form.chronic_conditions.split(',').map(item => item.trim()).filter(Boolean) : [];
      }

      const updated = await api.put('/auth/profile', payload);
      setProfile(updated);
      onUserUpdate(updated);
      setIsEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
    setSaving(false);
  };

  if (loading) return <div className="pt-24"><Spinner /></div>;

  const displayValue = (value) => (value ? value : 'Not provided');

  return (
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="profile-page">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600">View your submitted details. Edit only when needed.</p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition">
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><p className="text-sm text-gray-500">Name</p><p className="font-semibold text-gray-800">{displayValue(profile?.name)}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-semibold text-gray-800">{displayValue(profile?.email)}</p></div>
              <div><p className="text-sm text-gray-500">Role</p><p className="font-semibold text-gray-800">{displayValue(profile?.role)}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-semibold text-gray-800">{displayValue(profile?.phone)}</p></div>
              {!hasRole(user, ['doctor']) && (
                <>
                  <div><p className="text-sm text-gray-500">Address</p><p className="font-semibold text-gray-800">{displayValue(profile?.address)}</p></div>
                  <div><p className="text-sm text-gray-500">Date of Birth</p><p className="font-semibold text-gray-800">{displayValue(profile?.date_of_birth)}</p></div>
                  <div><p className="text-sm text-gray-500">Blood Group</p><p className="font-semibold text-gray-800">{displayValue(profile?.blood_group)}</p></div>
                  <div><p className="text-sm text-gray-500">Emergency Contact</p><p className="font-semibold text-gray-800">{displayValue(profile?.emergency_contact)}</p></div>
                  <div><p className="text-sm text-gray-500">Allergies</p><p className="font-semibold text-gray-800">{displayValue(Array.isArray(profile?.allergies) ? profile.allergies.join(', ') : '')}</p></div>
                  <div><p className="text-sm text-gray-500">Chronic Conditions</p><p className="font-semibold text-gray-800">{displayValue(Array.isArray(profile?.chronic_conditions) ? profile.chronic_conditions.join(', ') : '')}</p></div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              {!hasRole(user, ['doctor']) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <input value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (comma separated)</label>
                    <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions (comma separated)</label>
                    <input value={form.chronic_conditions} onChange={(e) => setForm({ ...form, chronic_conditions: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Messages Page
const MessagesPage = ({ user, showToast, pageParams }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(pageParams?.chatWith || null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (activeChat) loadMessages(activeChat);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const token = getAccessToken();
    if (!token) return undefined;

    const wsUrl = buildWebSocketUrl(`/api/ws/${user.id}`, token);
    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.sender_id === activeChat || msg.receiver_id === activeChat) {
        setMessages(prev => [...prev, msg]);
      }
    };
    return () => wsRef.current?.close();
  }, [user, activeChat]);

  const loadConversations = async () => {
    try {
      const data = await api.get('/conversations');
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadDoctors = async () => {
    try {
      const data = await api.get('/doctors');
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const data = await api.get(`/messages/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      await api.post('/messages', { receiver_id: activeChat, content: newMessage });
      setNewMessage('');
      loadMessages(activeChat);
    } catch (err) {
      showToast('Failed to send message', 'error');
    }
  };

  const activeChatUser = conversations.find(c => c.user_id === activeChat) || doctors.find(d => d.id === activeChat);

  return (
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="messages-page">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r bg-gray-50 flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {user?.role === 'patient' && (
                  <div className="p-4 border-b">
                    <p className="text-sm font-medium text-gray-500 mb-2">Start chat with a doctor</p>
                    <select onChange={e => setActiveChat(e.target.value)} className="w-full p-2 border rounded-lg" value={activeChat || ''}>
                      <option value="">Select a doctor</option>
                      {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                      ))}
                    </select>
                  </div>
                )}
                {conversations.map(conv => (
                  <div key={conv.user_id} onClick={() => setActiveChat(conv.user_id)} className={`p-4 cursor-pointer hover:bg-gray-100 border-b ${activeChat === conv.user_id ? 'bg-teal-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
                        {conv.user_name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{conv.user_name}</p>
                        <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeChat ? (
                <>
                  <div className="p-4 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
                      {activeChatUser?.user_name?.charAt(0) || activeChatUser?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{activeChatUser?.user_name || activeChatUser?.name}</p>
                      <p className="text-sm text-gray-500">{activeChatUser?.user_role || activeChatUser?.specialty}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender_id === user?.id ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-teal-100' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500" data-testid="message-input" />
                      <button onClick={sendMessage} className="bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition" data-testid="send-btn">
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Medical Reports Page
const ReportsPage = ({ user, showToast }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [patients, setPatients] = useState([]);
  const [uploadForm, setUploadForm] = useState({ patient_id: '', report_type: '', report_name: '', notes: '', file_url: '' });

  useEffect(() => {
    loadReports();
    if (user?.role !== 'patient') loadPatients();
  }, [user]);

  const loadReports = async () => {
    try {
      const data = await api.get('/reports');
      setReports(data);
    } catch (err) {
      showToast('Failed to load reports', 'error');
    }
    setLoading(false);
  };

  const loadPatients = async () => {
    try {
      const data = await api.get('/patients');
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    Object.keys(uploadForm).forEach(key => formData.append(key, uploadForm[key]));
    try {
      await api.postForm('/reports', formData);
      showToast('Report uploaded successfully!', 'success');
      setShowUpload(false);
      setUploadForm({ patient_id: '', report_type: '', report_name: '', notes: '', file_url: '' });
      loadReports();
    } catch (err) {
      showToast('Failed to upload report', 'error');
    }
  };

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen" data-testid="reports-page">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Medical Reports</h1>
            <p className="text-gray-600">View and download your medical reports</p>
          </div>
          {user?.role !== 'patient' && (
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition" data-testid="upload-btn">
              <Upload size={20} /> Upload Report
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition" data-testid={`report-${report.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <FileText className="text-teal-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{report.report_name}</h3>
                    <p className="text-sm text-gray-500">{report.report_type}</p>
                  </div>
                </div>
              </div>
              {report.notes && <p className="mt-4 text-gray-600 text-sm">{report.notes}</p>}
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</p>
                <button
                  onClick={() => {
                    if (!openExternalUrlSafely(report.file_url)) {
                      showToast('Unable to open report link', 'error');
                    }
                  }}
                  className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium"
                >
                  <Download size={18} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No reports available</p>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Upload Report</h2>
                <button onClick={() => setShowUpload(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                  <select value={uploadForm.patient_id} onChange={e => setUploadForm({...uploadForm, patient_id: e.target.value})} className="w-full p-3 border rounded-lg">
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} - {p.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select value={uploadForm.report_type} onChange={e => setUploadForm({...uploadForm, report_type: e.target.value})} className="w-full p-3 border rounded-lg">
                    <option value="">Select Type</option>
                    <option value="Blood Test">Blood Test</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input type="text" value={uploadForm.report_name} onChange={e => setUploadForm({...uploadForm, report_name: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="e.g., Blood Test Results" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File URL</label>
                  <input type="url" value={uploadForm.file_url} onChange={e => setUploadForm({...uploadForm, file_url: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="https://example.com/report.pdf" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea value={uploadForm.notes} onChange={e => setUploadForm({...uploadForm, notes: e.target.value})} className="w-full p-3 border rounded-lg h-24" placeholder="Additional notes..." />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setShowUpload(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold">Cancel</button>
                <button onClick={handleUpload} className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition">Upload</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// AI Chatbot Component
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: "Hello! I'm Nirmaya's AI assistant. How can I help you today?" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', input);
      formData.append('history', JSON.stringify(messages));
      const response = await api.postForm('/chatbot', formData);
      setMessages(prev => [...prev, { from: 'bot', text: response.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50" data-testid="chatbot-window">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <span className="font-semibold">Nirmaya AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-3 ${msg.from === 'bot' ? 'text-left' : 'text-right'}`}>
                <span className={`inline-block p-3 rounded-2xl max-w-[85%] ${msg.from === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-teal-500 text-white'}`}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div className="text-center text-gray-500">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500" data-testid="chatbot-input" />
              <button onClick={handleSend} className="bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600" data-testid="chatbot-send">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition flex items-center gap-3 z-50" data-testid="chatbot-toggle">
        <span className="font-semibold">Need help?</span>
        <Bot size={24} />
      </button>
    </>
  );
};

// About Page
const AboutPage = () => (
  <div className="py-24 bg-gray-50" data-testid="about-page">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About Nirmaya Health Services</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Dedicated to providing exceptional healthcare with compassion and innovation</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600" alt="Hospital" className="rounded-2xl shadow-xl" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">At Nirmaya Health Services, we believe in providing accessible, high-quality healthcare to everyone. Our state-of-the-art facilities and expert medical professionals are committed to your well-being.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <h4 className="font-semibold text-2xl text-teal-600">50+</h4>
              <p className="text-gray-500">Expert Doctors</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h4 className="font-semibold text-2xl text-teal-600">100K+</h4>
              <p className="text-gray-500">Patients Treated</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h4 className="font-semibold text-2xl text-teal-600">15+</h4>
              <p className="text-gray-500">Departments</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h4 className="font-semibold text-2xl text-teal-600">24/7</h4>
              <p className="text-gray-500">Emergency Care</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main App Component
const App = () => {
  const initialRoute = getRouteFromLocation();
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [pageParams, setPageParams] = useState(initialRoute.params);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncRouteFromLocation = () => {
      const route = getRouteFromLocation();
      setCurrentPage(route.page);
      setPageParams(route.params);
    };

    window.addEventListener('popstate', syncRouteFromLocation);
    syncRouteFromLocation();
    api.get('/health', { force: true, cacheTtlMs: 30000 }).catch(() => {});
    const keepAlive = window.setInterval(() => {
      api.get('/health', { force: true, cacheTtlMs: 0 }).catch(() => {});
    }, 4 * 60 * 1000);
    const prefetchCatalogData = () => {
      api.get('/doctors').catch(() => {});
      api.get('/equipment').catch(() => {});
      api.get('/departments').catch(() => {});
      api.get('/health-packages').catch(() => {});
    };
    let prefetchHandle;
    if ('requestIdleCallback' in window) {
      prefetchHandle = window.requestIdleCallback(prefetchCatalogData, { timeout: 4000 });
    } else {
      prefetchHandle = window.setTimeout(prefetchCatalogData, 1500);
    }

    const bootstrapAuth = async () => {
      const token = getAccessToken();
      const cachedProfile = getCachedUserProfile();

      if (cachedProfile) {
        setUser({ ...cachedProfile, role: normalizeRole(cachedProfile?.role) });
      }
      setLoading(false);

      if (!token) {
        clearCachedUserProfile();
        return;
      }

      try {
        const userData = await api.get('/auth/me', { force: true, cacheTtlMs: 20000 });
        const normalizedUser = { ...userData, role: normalizeRole(userData?.role) };
        setUser(normalizedUser);
        setCachedUserProfile(normalizedUser);
      } catch (err) {
        clearAccessToken();
        setUser(null);
      }
    };

    bootstrapAuth();

    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.clearInterval(keepAlive);
      if ('cancelIdleCallback' in window && 'requestIdleCallback' in window) {
        window.cancelIdleCallback(prefetchHandle);
      } else {
        window.clearTimeout(prefetchHandle);
      }
    };
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigateTo = (page, params = {}) => {
    const destination = buildRouteUrl(page, params);
    const current = `${window.location.pathname}${window.location.search}`;
    if (destination === current) {
      setCurrentPage(page);
      setPageParams(params);
      window.scrollTo(0, 0);
      return;
    }
    // MPA-style navigation: each major route transition performs a full document load.
    window.location.assign(destination);
  };

  const handleLogout = () => {
    clearAccessToken();
    window.location.assign(PAGE_PATHS.home);
  };

  const handleLogin = (userData) => {
    const normalizedUser = { ...userData, role: normalizeRole(userData?.role) };
    setUser(normalizedUser);
    setCachedUserProfile(normalizedUser);
    window.location.assign(buildRouteUrl(getPrimaryDashboardRoute(normalizedUser)));
  };

  const handleUserUpdate = (updatedUser) => {
    setUser((current) => {
      const merged = {
      ...current,
      ...updatedUser,
      role: normalizeRole(updatedUser?.role || current?.role),
      };
      setCachedUserProfile(merged);
      return merged;
    });
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage navigateTo={navigateTo} />;
      case 'about': return <AboutPage />;
      case 'login': return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} showToast={showToast} />;
      case 'register': return <RegisterPage onLogin={handleLogin} navigateTo={navigateTo} showToast={showToast} />;
      case 'doctors': return <DoctorsPage navigateTo={navigateTo} showToast={showToast} pageParams={pageParams} />;
      case 'appointments': return <AppointmentsPage user={user} navigateTo={navigateTo} showToast={showToast} pageParams={pageParams} />;
      case 'equipment': return <EquipmentPage showToast={showToast} />;
      case 'dashboard':
        if (!user) return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} showToast={showToast} />;
        if (hasRole(user, ['admin', 'hospital_administrator', 'staff', 'nurse'])) {
          return <OperationsDashboard user={user} navigateTo={navigateTo} showToast={showToast} />;
        }
        if (hasRole(user, ['doctor'])) {
          return <DoctorPortal user={user} navigateTo={navigateTo} showToast={showToast} />;
        }
        return <PatientDashboard user={user} navigateTo={navigateTo} showToast={showToast} />;
      case 'doctor-portal': return <DoctorPortal user={user} navigateTo={navigateTo} showToast={showToast} />;
      case 'admin': return <AdminDashboard showToast={showToast} navigateTo={navigateTo} />;
      case 'operations':
        if (!user || !hasRole(user, ['admin', 'hospital_administrator', 'staff', 'nurse', 'doctor'])) {
          return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} showToast={showToast} />;
        }
        return <OperationsDashboard user={user} navigateTo={navigateTo} showToast={showToast} />;
      case 'profile':
        if (!user) return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} showToast={showToast} />;
        return <ProfilePage user={user} onUserUpdate={handleUserUpdate} showToast={showToast} />;
      case 'messages': return <MessagesPage user={user} showToast={showToast} pageParams={pageParams} />;
      case 'reports': return <ReportsPage user={user} showToast={showToast} />;
      case 'departments': return <DepartmentsPage navigateTo={navigateTo} showToast={showToast} />;
      case 'health-packages': return <HealthPackagesPage user={user} navigateTo={navigateTo} showToast={showToast} />;
      case 'beds': return <BedAvailabilityPage user={user} showToast={showToast} />;
      case 'lab-tests': return <LabTestsPage user={user} navigateTo={navigateTo} showToast={showToast} />;
      case 'ambulance': return <AmbulanceServicePage user={user} navigateTo={navigateTo} showToast={showToast} />;
      case 'inventory': return <InventoryPage user={user} showToast={showToast} />;
      case 'payment-success': return <PaymentSuccessPage showToast={showToast} navigateTo={navigateTo} />;
      case 'payment-cancel': return <PaymentCancelPage navigateTo={navigateTo} />;
      default: return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} navigateTo={navigateTo} currentPage={currentPage} />
      <main className="pt-16">
        {renderPage()}
      </main>
      <Footer navigateTo={navigateTo} />
      <Chatbot />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
