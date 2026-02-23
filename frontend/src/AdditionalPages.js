// Additional Pages for Nirmaya Health Services
import React, { useState, useEffect } from 'react';
import {
  HeartPulse, Activity, Users, Calendar, Clock, MapPin, Phone, 
  Search, ChevronRight, Ambulance, Bed, Package, TestTube, Building2,
  Stethoscope, Star, Check, AlertCircle, X, Filter, Plus, Minus,
  Syringe, Pill, Shield, Award, ArrowRight, CheckCircle, CreditCard, Loader
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : '/api';

const normalizeRole = (role = '') => {
  const normalized = String(role).toLowerCase();
  if (normalized === 'hospital_admin') return 'hospital_administrator';
  return normalized;
};

const hasRole = (user, roles) => {
  const currentRole = normalizeRole(user?.role);
  return roles.map(normalizeRole).includes(currentRole);
};

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Request failed');
    }
    return response.json();
  },
  get: (endpoint) => api.request(endpoint),
  post: (endpoint, data) => api.request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  postForm: async (endpoint, formData) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers, body: formData });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }
};

const Spinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
  </div>
);

// ==================== DEPARTMENTS PAGE ====================
export const DepartmentsPage = ({ navigateTo, showToast }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await api.get('/departments');
      setDepartments(data);
    } catch (err) {
      showToast('Failed to load departments', 'error');
    }
    setLoading(false);
  };

  const loadDepartmentDetails = async (slug) => {
    try {
      const data = await api.get(`/departments/${slug}`);
      setSelectedDept(data);
    } catch (err) {
      showToast('Failed to load department details', 'error');
    }
  };

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Departments</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive healthcare across 16+ specialized departments with expert doctors and advanced facilities</p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search departments..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDepts.map(dept => (
            <div
              key={dept.id}
              onClick={() => loadDepartmentDetails(dept.slug)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer group"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={dept.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400'}
                  alt={dept.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{dept.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{dept.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-600 font-medium">{dept.diseases_treated?.length || 0} Conditions</span>
                  <ChevronRight className="text-gray-400 group-hover:text-teal-500 transition" size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDepts.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No departments found</p>
          </div>
        )}
      </div>

      {/* Department Detail Modal */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDept(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img
                src={selectedDept.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'}
                alt={selectedDept.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedDept(null)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h2 className="text-3xl font-bold text-white">{selectedDept.name}</h2>
                <p className="text-gray-200">{selectedDept.head_doctor && `Head: ${selectedDept.head_doctor}`}</p>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 text-lg mb-6">{selectedDept.description}</p>

              {/* Diseases Treated */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="text-teal-500" size={20} /> Conditions We Treat
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDept.diseases_treated?.map((disease, i) => (
                    <span key={i} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm">{disease}</span>
                  ))}
                </div>
              </div>

              {/* Surgeries */}
              {selectedDept.surgeries_offered?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Syringe className="text-teal-500" size={20} /> Surgeries & Procedures
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDept.surgeries_offered?.map((surgery, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{surgery}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features & Benefits */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Shield className="text-teal-500" size={20} /> Key Features
                  </h4>
                  <ul className="space-y-2">
                    {selectedDept.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle size={16} className="text-green-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Award className="text-teal-500" size={20} /> Benefits
                  </h4>
                  <ul className="space-y-2">
                    {selectedDept.benefits?.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle size={16} className="text-green-500" /> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Doctors */}
              {selectedDept.doctors?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Stethoscope className="text-teal-500" size={20} /> Our Specialists
                  </h4>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedDept.doctors.map(doc => (
                      <div key={doc.id} className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.image || `https://ui-avatars.com/api/?name=${doc.name}&background=14b8a6&color=fff`}
                            alt={doc.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h5 className="font-semibold text-gray-800">{doc.name}</h5>
                            <p className="text-sm text-teal-600">{doc.specialty}</p>
                            <p className="text-xs text-gray-500">{doc.experience}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Packages */}
              {selectedDept.health_packages?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package className="text-teal-500" size={20} /> Health Packages
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedDept.health_packages.map(pkg => (
                      <div key={pkg.id} className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100">
                        <h5 className="font-semibold text-gray-800">{pkg.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {pkg.discounted_price ? (
                            <>
                              <span className="text-lg font-bold text-teal-600">â‚¹{pkg.discounted_price}</span>
                              <span className="text-sm text-gray-400 line-through">â‚¹{pkg.price}</span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-teal-600">â‚¹{pkg.price}</span>
                          )}
                        </div>
                        <button
                          onClick={() => { setSelectedDept(null); navigateTo('health-packages', { packageId: pkg.id }); }}
                          className="mt-3 text-teal-600 font-medium text-sm flex items-center gap-1 hover:text-teal-700"
                        >
                          View Details <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => { setSelectedDept(null); navigateTo('doctors', { department: selectedDept.name }); }}
                  className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
                >
                  View All Doctors
                </button>
                <button
                  onClick={() => { setSelectedDept(null); navigateTo('appointments'); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== HEALTH PACKAGES PAGE ====================
export const HealthPackagesPage = ({ user, navigateTo, showToast }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await api.get('/health-packages');
      setPackages(data);
    } catch (err) {
      showToast('Failed to load packages', 'error');
    }
    setLoading(false);
  };

  const categories = [...new Set(packages.map(p => p.category))];
  const filtered = category ? packages.filter(p => p.category === category) : packages;

  const handleBook = async () => {
    if (!user) {
      showToast('Please login to book a package', 'error');
      navigateTo('login');
      return;
    }
    if (!bookingDate) {
      showToast('Please select a preferred date', 'error');
      return;
    }
    
    setProcessing(true);
    try {
      // Create Stripe checkout session
      const response = await api.post('/payments/create-checkout', {
        package_id: selectedPkg.id,
        payment_type: 'package',
        origin_url: window.location.origin
      });
      
      // Redirect to Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      showToast(err.message || 'Failed to initiate payment', 'error');
      setProcessing(false);
    }
  };

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Health Checkup Packages</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive health packages designed for preventive care and early detection</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setCategory('')}
            className={`px-6 py-2 rounded-full transition ${!category ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`}
          >
            All Packages
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full transition ${category === cat ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{pkg.category}</span>
                <h3 className="text-xl font-bold mt-3">{pkg.name}</h3>
                <p className="text-teal-100 text-sm mt-1">{pkg.department}</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Tests Included:</p>
                  <div className="flex flex-wrap gap-1">
                    {pkg.tests_included?.slice(0, 4).map((test, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{test}</span>
                    ))}
                    {pkg.tests_included?.length > 4 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">+{pkg.tests_included.length - 4} more</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {pkg.discounted_price ? (
                      <>
                        <span className="text-2xl font-bold text-teal-600">â‚¹{pkg.discounted_price}</span>
                        <span className="text-gray-400 line-through ml-2">â‚¹{pkg.price}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-teal-600">â‚¹{pkg.price}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPkg(pkg)}
                    className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No packages found</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPkg(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white rounded-t-2xl">
              <h2 className="text-2xl font-bold">{selectedPkg.name}</h2>
              <p className="text-teal-100">{selectedPkg.department}</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Tests Included:</h4>
                <ul className="space-y-1">
                  {selectedPkg.tests_included?.map((test, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check size={14} className="text-green-500" /> {test}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Duration: {selectedPkg.duration}</p>
                {selectedPkg.ideal_for && <p className="text-sm text-gray-500">Ideal for: {selectedPkg.ideal_for}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-500">Total:</span>
                  <span className="text-2xl font-bold text-teal-600 ml-2">â‚¹{selectedPkg.discounted_price || selectedPkg.price}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedPkg(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                  <button 
                    onClick={handleBook} 
                    disabled={processing}
                    className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {processing ? (
                      <><Loader className="animate-spin" size={16} /> Processing...</>
                    ) : (
                      <><CreditCard size={16} /> Pay â‚¹{selectedPkg.discounted_price || selectedPkg.price}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== BED AVAILABILITY PAGE ====================
export const BedAvailabilityPage = ({ user, showToast }) => {
  const [beds, setBeds] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBed, setSelectedBed] = useState(null);
  const [admitForm, setAdmitForm] = useState({ patientId: '', patientName: '' });
  const [actionBedId, setActionBedId] = useState(null);

  const canManageBeds = hasRole(user, ['admin', 'staff', 'nurse', 'hospital_administrator']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bedsData, availData] = await Promise.all([
        api.get('/beds'),
        api.get('/beds/availability')
      ]);
      setBeds(bedsData);
      setAvailability(availData);
    } catch (err) {
      showToast('Failed to load bed data', 'error');
    }
    setLoading(false);
  };

  const openAdmitModal = (bed) => {
    setSelectedBed(bed);
    setAdmitForm({ patientId: '', patientName: '' });
  };

  const closeAdmitModal = () => {
    setSelectedBed(null);
    setAdmitForm({ patientId: '', patientName: '' });
  };

  const handleAdmit = async () => {
    if (!admitForm.patientId.trim() || !admitForm.patientName.trim()) {
      showToast('Patient ID and name are required', 'error');
      return;
    }
    setActionBedId(selectedBed.id);
    try {
      const formData = new FormData();
      formData.append('patient_id', admitForm.patientId.trim());
      formData.append('patient_name', admitForm.patientName.trim());
      await api.postForm(`/beds/${selectedBed.id}/admit`, formData);
      showToast('Patient admitted successfully', 'success');
      closeAdmitModal();
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to admit patient', 'error');
    }
    setActionBedId(null);
  };

  const handleDischarge = async (bed) => {
    setActionBedId(bed.id);
    try {
      const formData = new FormData();
      await api.postForm(`/beds/${bed.id}/discharge`, formData);
      showToast('Patient discharged successfully', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to discharge patient', 'error');
    }
    setActionBedId(null);
  };

  const wards = Object.keys(availability);
  const filteredBeds = selectedWard ? beds.filter(b => b.ward === selectedWard) : beds;

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Bed Availability</h1>
          <p className="text-gray-600">Real-time hospital bed availability across all wards</p>
        </div>

        {canManageBeds && (
          <div className="bg-teal-50 border border-teal-100 text-teal-700 rounded-xl p-4 mb-8">
            <p className="font-medium">Bed management enabled</p>
            <p className="text-sm">You can admit and discharge patients directly from this section.</p>
          </div>
        )}

        {/* Ward Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
          {wards.map(ward => (
            <div
              key={ward}
              onClick={() => setSelectedWard(selectedWard === ward ? '' : ward)}
              className={`bg-white rounded-xl p-4 shadow cursor-pointer transition hover:shadow-lg ${selectedWard === ward ? 'ring-2 ring-teal-500' : ''}`}
            >
              <h4 className="font-semibold text-gray-800 text-sm truncate">{ward}</h4>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">{availability[ward]?.available || 0}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500">{availability[ward]?.total || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Available</p>
            </div>
          ))}
        </div>

        {/* Beds Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {selectedWard ? `${selectedWard} Beds` : 'All Beds'}
            </h3>
            {selectedWard && (
              <button onClick={() => setSelectedWard('')} className="text-teal-600 hover:text-teal-700">
                View All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredBeds.map(bed => (
              <div
                key={bed.id}
                className={`p-4 rounded-xl border-2 ${bed.status === 'available' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Bed size={20} className={bed.status === 'available' ? 'text-green-600' : 'text-red-600'} />
                  <span className={`text-xs px-2 py-1 rounded-full ${bed.status === 'available' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                    {bed.status}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800">{bed.bed_number}</h4>
                <p className="text-xs text-gray-500">{bed.ward}</p>
                <p className="text-xs text-gray-500">{bed.bed_type}</p>
                <p className="text-sm font-medium text-teal-600 mt-2">INR {bed.price_per_day}/day</p>
                {canManageBeds && (
                  <div className="mt-3">
                    {bed.status === 'available' ? (
                      <button
                        onClick={() => openAdmitModal(bed)}
                        disabled={actionBedId === bed.id}
                        className="w-full text-xs bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 disabled:opacity-50"
                      >
                        {actionBedId === bed.id ? 'Admitting...' : 'Admit'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDischarge(bed)}
                        disabled={actionBedId === bed.id}
                        className="w-full text-xs bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50"
                      >
                        {actionBedId === bed.id ? 'Discharging...' : 'Discharge'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredBeds.length === 0 && (
            <div className="text-center py-8">
              <Bed size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No beds found</p>
            </div>
          )}
        </div>
      </div>

      {selectedBed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAdmitModal}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Admit Patient</h2>
            <p className="text-sm text-gray-500 mb-6">
              Bed: {selectedBed.bed_number} | Ward: {selectedBed.ward}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                <input
                  type="text"
                  value={admitForm.patientId}
                  onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., PAT-1001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  value={admitForm.patientName}
                  onChange={(e) => setAdmitForm({ ...admitForm, patientName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Patient full name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeAdmitModal} className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleAdmit}
                disabled={actionBedId === selectedBed.id}
                className="flex-1 bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 disabled:opacity-50"
              >
                {actionBedId === selectedBed.id ? 'Saving...' : 'Confirm Admit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== LAB TESTS PAGE ====================
export const LabTestsPage = ({ user, navigateTo, showToast }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: '', time: '', notes: '' });
  useEffect(() => {
    loadTests();
  }, []);
  const loadTests = async () => {
    try {
      const data = await api.get('/lab-tests');
      setTests(data);
    } catch (err) {
      showToast('Failed to load tests', 'error');
    }
    setLoading(false);
  };
  const categories = [...new Set(tests.map(t => t.category))];
  const filtered = category ? tests.filter(t => t.category === category) : tests;
  const getTestIncludes = (test) => {
    if (Array.isArray(test?.includes) && test.includes.length > 0) {
      return test.includes;
    }
    return [
      `${test?.test_name || 'Diagnostic'} sample collection`,
      'Laboratory analysis by certified technicians',
      'Quality-checked digital report delivery',
    ];
  };
  const getPriceBreakup = (test) => {
    const breakup = test?.price_breakup;
    if (breakup && typeof breakup === 'object') {
      return breakup;
    }
    const total = Number(test?.price || 0);
    return {
      base_test_charge: Number((total * 0.8).toFixed(2)),
      sample_collection_charge: Number((total * 0.12).toFixed(2)),
      reporting_charge: Number((total * 0.08).toFixed(2)),
      total,
    };
  };
  const handleBook = async () => {
    if (!user) {
      showToast('Please login to book a test', 'error');
      navigateTo('login');
      return;
    }
    if (!bookingForm.date || !bookingForm.time) {
      showToast('Please select preferred date and time', 'error');
      return;
    }
    try {
      await api.post('/lab-tests/book', {
        test_id: selectedTest.id,
        preferred_date: bookingForm.date,
        preferred_time: bookingForm.time,
        notes: bookingForm.notes
      });
      showToast('Test booked successfully!', 'success');
      setSelectedTest(null);
      setShowBookingForm(false);
      setBookingForm({ date: '', time: '', notes: '' });
    } catch (err) {
      showToast('Failed to book test', 'error');
    }
  };
  if (loading) return <div className="pt-24"><Spinner /></div>;
  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Lab Tests</h1>
          <p className="text-gray-600">Book diagnostic tests with accurate results and quick turnaround</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setCategory('')}
            className={`px-6 py-2 rounded-full transition ${!category ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`}
          >
            All Tests
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full transition ${category === cat ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(test => (
            <div
              key={test.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
              onClick={() => {
                setSelectedTest(test);
                setShowBookingForm(false);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <TestTube className="text-teal-600" size={24} />
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{test.category}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{test.test_name}</h3>
              <p className="text-gray-600 text-sm mb-4">{test.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Clock size={14} /> {test.duration}</span>
              </div>
              {test.preparation && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-4">
                  <AlertCircle size={12} className="inline mr-1" /> {test.preparation}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 pt-4 border-t">
                <span className="text-xl font-bold text-teal-600">INR {test.price}</span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTest(test);
                      setShowBookingForm(false);
                    }}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTest(test);
                      setShowBookingForm(true);
                    }}
                    className="bg-teal-500 text-white px-3 py-2 rounded-lg hover:bg-teal-600 transition text-sm"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTest(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedTest.test_name}</h2>
                <p className="text-gray-500">{selectedTest.category} | {selectedTest.duration}</p>
              </div>
              <button onClick={() => setSelectedTest(null)} className="text-gray-500 hover:text-gray-700">
                <X size={22} />
              </button>
            </div>
            <p className="text-gray-700 mb-4">{selectedTest.description || 'Accurate diagnostics with reliable reporting.'}</p>
            {selectedTest.preparation && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg mb-5">
                <AlertCircle size={14} className="inline mr-1" /> Preparation: {selectedTest.preparation}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">What This Test Includes</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {getTestIncludes(selectedTest).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-500 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Price Breakup</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Base Test Charge</span>
                    <span>INR {getPriceBreakup(selectedTest).base_test_charge}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sample Collection</span>
                    <span>INR {getPriceBreakup(selectedTest).sample_collection_charge}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reporting</span>
                    <span>INR {getPriceBreakup(selectedTest).reporting_charge}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold text-gray-800">
                    <span>Total</span>
                    <span>INR {getPriceBreakup(selectedTest).total}</span>
                  </div>
                </div>
              </div>
            </div>
            {!showBookingForm ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTest(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="flex-1 bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600"
                >
                  Book This Test
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <select
                    value={bookingForm.time}
                    onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select time</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg h-20"
                    placeholder="Any special instructions..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBook}
                    className="flex-1 bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== AMBULANCE SERVICE PAGE ====================
export const AmbulanceServicePage = ({ user, navigateTo, showToast }) => {
  const [ambulances, setAmbulances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ambulance_type: 'Basic Life Support',
    patient_name: '',
    phone: '',
    pickup_address: '',
    emergency_type: 'Emergency',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ambData = await api.get('/ambulances');
      setAmbulances(ambData);
      if (user) {
        const reqData = await api.get('/ambulances/requests');
        setRequests(reqData);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to request ambulance', 'error');
      navigateTo('login');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      const result = await api.postForm('/ambulances/request', formData);
      showToast(`Ambulance dispatched! ETA: ${result.eta_minutes} minutes`, 'success');
      setShowForm(false);
      setForm({
        ambulance_type: 'Basic Life Support',
        patient_name: '',
        phone: '',
        pickup_address: '',
        emergency_type: 'Emergency',
        notes: ''
      });
      loadData();
    } catch (err) {
      showToast('Failed to request ambulance', 'error');
    }
    setSubmitting(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      dispatched: 'bg-blue-100 text-blue-700',
      en_route: 'bg-yellow-100 text-yellow-700',
      arrived: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 md:p-12 mb-10 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">ðŸš‘ Ambulance Service</h1>
              <p className="text-red-100 text-lg mb-4">24/7 Emergency & Scheduled Ambulance Services</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">Response Time: 5-15 mins</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">{ambulances.filter(a => a.status === 'available').length} Available</span>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition shadow-lg"
            >
              Request Ambulance Now
            </button>
          </div>
        </div>

        {/* Ambulance Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
              <Ambulance className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Advanced Life Support</h3>
            <p className="text-gray-600 text-sm mb-4">Equipped with ventilator, defibrillator, cardiac monitor for critical emergencies.</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>â€¢ Ventilator & Defibrillator</li>
              <li>â€¢ Cardiac Monitor</li>
              <li>â€¢ Trained Paramedics</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
              <Ambulance className="text-orange-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Basic Life Support</h3>
            <p className="text-gray-600 text-sm mb-4">Standard emergency transport with oxygen and first aid equipment.</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>â€¢ Oxygen Supply</li>
              <li>â€¢ First Aid Kit</li>
              <li>â€¢ Stretcher & Wheelchair</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <Ambulance className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Patient Transport</h3>
            <p className="text-gray-600 text-sm mb-4">Non-emergency transfers for appointments, dialysis, or hospital transfers.</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>â€¢ AC Cabin</li>
              <li>â€¢ Wheelchair Accessible</li>
              <li>â€¢ Comfortable Stretcher</li>
            </ul>
          </div>
        </div>

        {/* My Requests */}
        {user && requests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Ambulance Requests</h3>
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{req.emergency_type} - {req.ambulance_type}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(req.status)}`}>
                      {req.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm"><MapPin size={14} className="inline mr-1" />{req.pickup_address}</p>
                  {req.assigned_ambulance && (
                    <p className="text-gray-500 text-sm mt-1">
                      Ambulance: {req.assigned_ambulance} | Driver: {req.driver_name} | <Phone size={12} className="inline" /> {req.driver_phone}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    {req.status_history?.map((s, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
                        <CheckCircle size={12} className="text-green-500" />
                        {s.status?.replace('_', ' ')}
                        {i < req.status_history.length - 1 && <span className="mx-1">â†’</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="bg-gray-800 rounded-xl p-6 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Emergency Helpline</h3>
          <p className="text-4xl font-bold text-red-400 mb-2">ðŸ“ž 108</p>
          <p className="text-gray-400">Available 24/7 for medical emergencies</p>
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Request Ambulance</h2>
              <button onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Type</label>
                <select
                  value={form.emergency_type}
                  onChange={e => setForm({...form, emergency_type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="Emergency">Emergency (Immediate)</option>
                  <option value="Scheduled">Scheduled Transport</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ambulance Type</label>
                <select
                  value={form.ambulance_type}
                  onChange={e => setForm({...form, ambulance_type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="Advanced Life Support">Advanced Life Support</option>
                  <option value="Basic Life Support">Basic Life Support</option>
                  <option value="Patient Transport">Patient Transport</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  value={form.patient_name}
                  onChange={e => setForm({...form, patient_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
                <textarea
                  value={form.pickup_address}
                  onChange={e => setForm({...form, pickup_address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-20"
                  placeholder="Full address with landmarks..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-16"
                  placeholder="Medical condition, special requirements..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {submitting ? 'Dispatching...' : 'Request Ambulance'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== INVENTORY PAGE (Staff) ====================
export const InventoryPage = ({ user, showToast }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [lowStock]);

  const loadInventory = async () => {
    try {
      const data = await api.get(`/inventory${lowStock ? '?low_stock=true' : ''}`);
      setInventory(data);
    } catch (err) {
      showToast('Failed to load inventory', 'error');
    }
    setLoading(false);
  };

  const categories = [...new Set(inventory.map(i => i.category))];
  const filtered = category ? inventory.filter(i => i.category === category) : inventory;

  if (!user || !hasRole(user, ['admin', 'staff', 'doctor', 'nurse', 'hospital_administrator'])) {
    return (
      <div className="py-24 flex items-center justify-center">
        <p className="text-gray-500">Access denied. Staff access required.</p>
      </div>
    );
  }

  if (loading) return <div className="pt-24"><Spinner /></div>;

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
            <p className="text-gray-600">Track and manage hospital supplies</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStock}
                onChange={e => setLowStock(e.target.checked)}
                className="w-4 h-4 text-teal-500"
              />
              <span className="text-sm text-gray-600">Show Low Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 rounded-lg transition ${!category ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg transition ${category === cat ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Item</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(item => {
                const isLow = item.quantity <= item.min_threshold;
                return (
                  <tr key={item.id} className={isLow ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{item.item_name}</p>
                        <p className="text-sm text-gray-500">{item.supplier}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                        {item.quantity} {item.unit}
                      </span>
                      <p className="text-xs text-gray-500">Min: {item.min_threshold}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No inventory items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ==================== PAYMENT SUCCESS PAGE ====================
export const PaymentSuccessPage = ({ showToast, navigateTo }) => {
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setStatus('error');
    }
  }, []);

  const pollPaymentStatus = async (sessionId) => {
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }
    
    try {
      const response = await api.get(`/payments/status/${sessionId}`);
      setPaymentData(response);
      
      if (response.payment_status === 'paid') {
        setStatus('success');
        showToast('Payment successful!', 'success');
      } else if (response.status === 'expired') {
        setStatus('expired');
      } else {
        // Continue polling
        setAttempts(prev => prev + 1);
        setTimeout(() => pollPaymentStatus(sessionId), 2000);
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="py-24 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'checking' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="text-blue-500 animate-spin" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Thank you for your booking.</p>
            {paymentData && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-xl font-bold text-teal-600">â‚¹{paymentData.amount}</p>
              </div>
            )}
            <button
              onClick={() => navigateTo('dashboard')}
              className="bg-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">There was an issue processing your payment.</p>
            <button
              onClick={() => navigateTo('health-packages')}
              className="bg-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
            >
              Try Again
            </button>
          </>
        )}
        
        {status === 'timeout' && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-yellow-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Status Unknown</h2>
            <p className="text-gray-600 mb-6">Please check your email for confirmation.</p>
            <button
              onClick={() => navigateTo('dashboard')}
              className="bg-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== PAYMENT CANCEL PAGE ====================
export const PaymentCancelPage = ({ navigateTo }) => {
  return (
    <div className="py-24 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="text-gray-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6">Your payment was cancelled. No charges were made.</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigateTo('health-packages')}
            className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
          >
            Back to Packages
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};


