// src/pages/DoctorPortal.js
import React from 'react';
import { Calendar, Clock, Trash2 } from 'lucide-react';

const DoctorPortal = ({ currentUser, bookings, deleteBooking }) => {
    if (!currentUser || currentUser.role !== 'doctor') {
        return <div className="py-20 text-center"><p>Access Denied. Please log in as a doctor.</p></div>;
    }

    const myAppointments = bookings.filter(b => b.doctor === currentUser.name);

    // Group appointments by date
    const groupedAppointments = myAppointments.reduce((acc, appointment) => {
        const date = appointment.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(appointment);
        // Sort appointments within each day by time
        acc[date].sort((a, b) => a.time.localeCompare(b.time));
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedAppointments).sort();

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name}</h2>
                <p className="text-lg text-gray-600 mb-8">Here are your scheduled appointments.</p>
                
                {sortedDates.length === 0 ? (
                    <div className="text-center bg-white p-12 rounded-lg shadow-md">
                        <p className="text-xl text-gray-600">You have no upcoming appointments.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedDates.map(date => (
                            <div key={date} className="bg-white p-8 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Calendar className="mr-3 text-blue-600" /> Appointments for {date}
                                </h3>
                                <div className="space-y-4">
                                    {groupedAppointments[date].map(booking => (
                                        <div key={booking.id} className="p-4 border rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-lg flex items-center"><Clock size={18} className="mr-2" />{booking.time}</p>
                                                <p className="text-gray-700 mt-1">Patient: <span className="font-semibold">{booking.name}</span></p>
                                                <p className="text-gray-500 text-sm mt-1">Reason: {booking.message || 'Not specified'}</p>
                                            </div>
                                            <button onClick={() => deleteBooking(booking.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                                                <Trash2 />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorPortal;