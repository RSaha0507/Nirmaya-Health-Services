// src/pages/AppointmentsPage.js
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, MessageSquare, Stethoscope, ShieldCheck, Phone } from 'lucide-react';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import TextareaField from '../components/TextareaField';

const AppointmentsPage = ({ navigateTo, currentUser, addBooking, doctors }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', department: '', doctor: '', date: '', time: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

    // Get a unique list of departments from the doctors array
    const departments = [...new Set(doctors.map(d => d.department))];

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({ ...prev, name: currentUser.name, email: currentUser.email }));
        }
    }, [currentUser]);

    // Effect to filter doctors when a department is selected
    useEffect(() => {
        if (formData.department) {
            setFilteredDoctors(doctors.filter(d => d.department === formData.department));
            setFormData(prev => ({ ...prev, doctor: '', time: '' })); // Reset doctor and time selection
        } else {
            setFilteredDoctors([]);
        }
    }, [formData.department, doctors]);

    // Effect to update time slots when a doctor is selected
    useEffect(() => {
        if (formData.doctor) {
            const selectedDoctor = doctors.find(d => d.name === formData.doctor);
            setAvailableTimeSlots(selectedDoctor ? selectedDoctor.timeSlots : []);
            setFormData(prev => ({ ...prev, time: '' })); // Reset time selection
        } else {
            setAvailableTimeSlots([]);
        }
    }, [formData.doctor, doctors]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addBooking({ ...formData, type: 'Appointment' });
        setIsSubmitted(true);
    };

    if (!currentUser) {
        return (
            <div className="py-20 flex items-center justify-center text-center min-h-[60vh]">
                <div>
                    <h2 className="text-3xl font-bold mb-4">Please Login to Book</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to book an appointment.</p>
                    <button onClick={() => navigateTo('Login')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700">Go to Login</button>
                </div>
            </div>
        );
    }
    
    if (isSubmitted) {
        return (
            <div className="py-20 bg-gray-50 flex items-center justify-center min-h-[60vh]">
                <div className="container mx-auto px-6 text-center bg-white p-12 rounded-lg shadow-xl max-w-2xl">
                    <ShieldCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Appointment Booked Successfully!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you, {formData.name}. A confirmation has been logged to our system. Check your "My Account" page for details.
                    </p>
                    <button 
                        onClick={() => { 
                            setIsSubmitted(false); 
                            navigateTo('UserDashboard'); 
                        }} 
                        className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition duration-300"
                    >
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 bg-blue-50">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-gray-800">Book an Appointment</h2>
                        <p className="text-gray-600 mt-2">Fill out the form below to schedule your visit.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField icon={<User />} type="text" name="name" placeholder="Full Name" value={formData.name} readOnly/>
                            <InputField icon={<Mail />} type="email" name="email" placeholder="Email Address" value={formData.email} readOnly/>
                            <InputField icon={<Phone />} type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required />
                            
                            {/* Department Select */}
                            <SelectField icon={<Stethoscope />} name="department" value={formData.department} onChange={handleInputChange} options={departments} required />
                            
                            {/* Dynamic Doctor Select */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User /></span>
                                <select name="doctor" value={formData.doctor} onChange={handleInputChange} required disabled={!formData.department} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none disabled:bg-gray-100">
                                    <option value="">{formData.department ? 'Select a Doctor' : 'Select Department First'}</option>
                                    {filteredDoctors.map(doc => <option key={doc.id} value={doc.name}>{doc.name}</option>)}
                                </select>
                            </div>

                            <InputField icon={<Calendar />} type="date" name="date" placeholder="Select Date" value={formData.date} onChange={handleInputChange} required />
                        </div>
                        
                        {/* Dynamic Time Slot Select */}
                        <div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Clock /></span>
                                <select name="time" value={formData.time} onChange={handleInputChange} required disabled={!formData.doctor} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none disabled:bg-gray-100">
                                    <option value="">{formData.doctor ? 'Select a Time Slot' : 'Select Doctor First'}</option>
                                    {availableTimeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <TextareaField icon={<MessageSquare />} name="message" placeholder="Reason for visit..." value={formData.message} onChange={handleInputChange} />
                        </div>
                        <div className="text-center">
                            <button type="submit" className="bg-blue-600 text-white w-full md:w-auto px-10 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition duration-300 shadow-lg">
                                Confirm Appointment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AppointmentsPage;
