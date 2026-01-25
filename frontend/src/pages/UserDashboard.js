// src/pages/UserDashboard.js
import React, { useState } from 'react';
import { Calendar, Clock, Lock, Phone } from 'lucide-react';
import InputField from '../components/InputField';

const UserDashboard = ({ currentUser, bookings, handleChangePassword, handlePhoneUpdate }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState(currentUser?.phone || '');

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (newPassword === confirmPassword && newPassword.length >= 6) {
            handleChangePassword(newPassword);
            setNewPassword('');
            setConfirmPassword('');
        } else {
            alert("Passwords do not match or are less than 6 characters.");
        }
    };
    
    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        handlePhoneUpdate(phone);
    };

    if (!currentUser) return null;

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6 space-y-8">
                <div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name}!</h2>
                    <p className="text-lg text-gray-600">Here are your account details and bookings.</p>
                </div>

                {/* Bookings Section */}
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h3>
                    {bookings.length === 0 ? (
                        <p className="text-gray-600">You have no upcoming bookings.</p>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map(booking => (
                                <div key={booking.id} className="p-4 border rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{booking.type === 'Appointment' ? `Dr. ${booking.doctor}` : booking.packageName}</p>
                                        <p className="text-gray-600">{booking.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-800"><Calendar size={16} className="inline mr-2" />{booking.date}</p>
                                        {booking.time && <p className="text-gray-600"><Clock size={16} className="inline mr-2" />{booking.time}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* 2FA / Phone Number Section */}
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Two-Factor Authentication</h3>
                    <form onSubmit={handlePhoneSubmit} className="max-w-sm space-y-4">
                        <InputField icon={<Phone />} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your Phone Number" required />
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                            {currentUser.phone ? 'Update Phone Number' : 'Enable 2FA'}
                        </button>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="max-w-sm space-y-4">
                        <InputField icon={<Lock />} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required />
                        <InputField icon={<Lock />} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required />
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Update Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
