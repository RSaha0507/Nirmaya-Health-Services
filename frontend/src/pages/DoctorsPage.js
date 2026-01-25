// src/pages/DoctorsPage.js
import React from 'react';

const DoctorsPage = ({ navigateTo, doctors }) => { 
    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Meet Our Doctors</h2>
                    <p className="text-lg text-gray-600 mt-2">Dedicated professionals at your service.</p>
                </div>
                {doctors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map((doctor) => (
                            <div key={doctor.id} className="bg-white rounded-lg shadow-lg overflow-hidden text-center transform hover:-translate-y-2 transition-transform duration-300">
                                <img src={doctor.image || 'https://placehold.co/300x300/E9F5FF/3B82F6?text=No+Image'} alt={doctor.name} className="w-full h-64 object-cover" />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                                    <p className="text-blue-600 font-semibold mt-1">{doctor.specialty}</p>
                                    <p className="text-gray-500 mt-2">{doctor.experience} of experience</p>
                                    <button 
                                        onClick={() => navigateTo('Appointments')} 
                                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition duration-300"
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-16">
                        <p>No doctors are available at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorsPage;
