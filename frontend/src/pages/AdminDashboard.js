// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Stethoscope, Trash2, Edit, PlusCircle, X } from 'lucide-react';

// --- Edit Booking Modal Component ---
const EditBookingModal = ({ booking, allDoctors, onSave, onCancel }) => {
    const [doctor, setDoctor] = useState(booking.doctor);
    const [time, setTime] = useState(booking.time);
    const selectedDoctor = allDoctors.find(d => d.name === doctor);

    const handleSave = () => {
        onSave(booking.id, { doctor, time });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold text-gray-800">Edit Appointment</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><X /></button></div>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Patient</label><p className="mt-1 p-2 border rounded-md bg-gray-100">{booking.name}</p></div>
                    <div><label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Doctor</label><select id="doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">{allDoctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
                    <div><label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label><select id="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">{selectedDoctor && selectedDoctor.timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}</select></div>
                </div>
                <div className="mt-8 flex justify-end space-x-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button></div>
            </div>
        </div>
    );
};

// --- Edit Doctor Modal Component ---
const EditDoctorModal = ({ doctor, onSave, onCancel }) => {
    const [doctorData, setDoctorData] = useState({ ...doctor, timeSlots: doctor.timeSlots.join(', ') });
    const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctorData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(doctor.id, doctorData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold text-gray-800">Edit Doctor</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><X /></button></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={doctorData.name} onChange={handleChange} placeholder="Doctor Name" className="p-2 border rounded" />
                    <input name="specialty" value={doctorData.specialty} onChange={handleChange} placeholder="Specialty" className="p-2 border rounded" />
                    <select name="department" value={doctorData.department} onChange={handleChange} className="p-2 border rounded"><option value="">Select Department</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <input name="experience" value={doctorData.experience} onChange={handleChange} placeholder="Experience" className="p-2 border rounded" />
                    <input name="loginEmail" value={doctorData.loginEmail} onChange={handleChange} placeholder="Login Email" className="p-2 border rounded" required />
                    <input name="image" value={doctorData.image} onChange={handleChange} placeholder="Image URL" className="p-2 border rounded" />
                    <input name="timeSlots" value={doctorData.timeSlots} onChange={handleChange} placeholder="Time Slots (e.g., 09:00, 10:00)" className="p-2 border rounded md:col-span-2" />
                </div>
                <div className="mt-8 flex justify-end space-x-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button></div>
            </div>
        </div>
    );
};

// --- Main Admin Dashboard Component ---
const AdminDashboard = ({ allUsers, allBookings, allDoctors, deleteUser, deleteBooking, updateBooking, addDoctor, deleteDoctor, updateDoctor }) => {
    const [editingBooking, setEditingBooking] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', department: '', experience: '', image: '', timeSlots: '', loginEmail: '' });

    const handleAddDoctor = (e) => {
        e.preventDefault();
        if (newDoctor.name && newDoctor.specialty && newDoctor.department && newDoctor.timeSlots && newDoctor.loginEmail) {
            addDoctor(newDoctor);
            setNewDoctor({ name: '', specialty: '', department: '', experience: '', image: '', timeSlots: '', loginEmail: '' });
        }
    };

    const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology'];

    return (
        <div className="py-20 bg-gray-100">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h2>
                <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Stethoscope className="mr-3" />Manage Doctors</h3>
                    <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
                        <input value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} placeholder="Doctor Name" className="p-2 border rounded" required />
                        <input value={newDoctor.specialty} onChange={e => setNewDoctor({...newDoctor, specialty: e.target.value})} placeholder="Specialty" className="p-2 border rounded" required />
                        <select value={newDoctor.department} onChange={e => setNewDoctor({...newDoctor, department: e.target.value})} className="p-2 border rounded" required><option value="">Select Department</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                        <input value={newDoctor.experience} onChange={e => setNewDoctor({...newDoctor, experience: e.target.value})} placeholder="Experience" className="p-2 border rounded" />
                        {/* Added Login Email Field */}
                        <input value={newDoctor.loginEmail} onChange={e => setNewDoctor({...newDoctor, loginEmail: e.target.value})} type="email" placeholder="Login Email" className="p-2 border rounded" required />
                        <input value={newDoctor.image} onChange={e => setNewDoctor({...newDoctor, image: e.target.value})} placeholder="Image URL" className="p-2 border rounded" />
                        <input value={newDoctor.timeSlots} onChange={e => setNewDoctor({...newDoctor, timeSlots: e.target.value})} placeholder="Time Slots (e.g., 09:00, 10:00)" className="p-2 border rounded md:col-span-2" required />
                        <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center justify-center md:col-span-3"><PlusCircle size={20} className="mr-2"/>Add Doctor</button>
                    </form>
                    <div className="space-y-3 max-h-60 overflow-y-auto">{allDoctors.map(doctor => (<div key={doctor.id} className="p-3 border rounded-lg flex justify-between items-center"><div><p className="font-semibold">{doctor.name} <span className="text-sm text-gray-500">- {doctor.specialty} ({doctor.department})</span></p></div><div className="flex space-x-3"><button onClick={() => setEditingDoctor(doctor)} className="text-blue-500 hover:text-blue-700"><Edit/></button><button onClick={() => deleteDoctor(doctor.id)} className="text-red-500 hover:text-red-700"><Trash2 /></button></div></div>))}</div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-lg shadow-lg"><h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Calendar className="mr-3" />All Bookings ({allBookings.length})</h3><div className="space-y-3 max-h-96 overflow-y-auto">{allBookings.map(booking => (<div key={booking.id} className="p-3 border rounded-lg"><p className="font-semibold">{booking.type}: {booking.type === 'Appointment' ? `Dr. ${booking.doctor}` : booking.packageName}</p><p className="text-sm text-gray-600">Patient: {booking.name} ({booking.userEmail})</p><p className="text-sm text-gray-500">Date: {booking.date} {booking.time && `at ${booking.time}`}</p><div className="flex space-x-2 mt-2">{booking.type === 'Appointment' && <button onClick={() => setEditingBooking(booking)} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>}<button onClick={() => deleteBooking(booking.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button></div></div>))}</div></div>
                    <div className="bg-white p-8 rounded-lg shadow-lg"><h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Users className="mr-3" />Registered Users ({allUsers.length})</h3><div className="space-y-3 max-h-96 overflow-y-auto">{allUsers.map(user => (<div key={user.id} className="p-3 border rounded-lg flex justify-between items-center"><div><p className="font-semibold">{user.name} {user.role === 'admin' && <span className="text-xs bg-blue-100 text-blue-800 p-1 rounded">Admin</span>}</p><p className="text-sm text-gray-600">{user.email}</p></div>{user.role !== 'admin' && <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700"><Trash2 /></button>}</div>))}</div></div>
                </div>
            </div>
            {editingBooking && <EditBookingModal booking={editingBooking} allDoctors={allDoctors} onSave={(id, data) => { updateBooking(id, data); setEditingBooking(null); }} onCancel={() => setEditingBooking(null)} />}
            {editingDoctor && <EditDoctorModal doctor={editingDoctor} onSave={(id, data) => { updateDoctor(id, data); setEditingDoctor(null); }} onCancel={() => setEditingDoctor(null)} />}
        </div>
    );
};

export default AdminDashboard;
