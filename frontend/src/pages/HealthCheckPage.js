// src/pages/HealthCheckPage.js
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const HealthCheckPage = ({ navigateTo, currentUser, addBooking }) => {
    const packages = [
        { name: 'Basic Health Check', price: '999', features: ['Complete Blood Count', 'Blood Sugar', 'Lipid Profile', 'Kidney Function Test', 'Doctor Consultation'] },
        { name: 'Advanced Health Check', price: '2499', features: ['All Basic tests', 'ECG', 'Chest X-Ray', 'Liver Function Test', 'Thyroid Profile', 'Vitamin D & B12'] },
        { name: 'Comprehensive Health Check', price: '4999', features: ['All Advanced tests', 'TMT (Treadmill Test)', 'Ultrasound Abdomen', 'Cancer Screening (PSA/Pap Smear)', 'Detailed Specialist Consultation'] },
    ];
    
    const [bookedPackage, setBookedPackage] = useState(null);

    const handleBookPackage = (pkg) => {
        if (!currentUser) {
            navigateTo('Login');
            return;
        }
        const bookingDetails = {
            type: 'Health Checkup',
            packageName: pkg.name,
            price: pkg.price,
            date: new Date().toISOString().split('T')[0], // Use today's date for simplicity
            name: currentUser.name,
        };
        addBooking(bookingDetails);
        setBookedPackage(pkg.name);
    };

    if (bookedPackage) {
        return (
             <div className="py-20 bg-gray-50 flex items-center justify-center min-h-[60vh]">
                <div className="container mx-auto px-6 text-center bg-white p-12 rounded-lg shadow-xl max-w-2xl">
                    <ShieldCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Health Check Booked!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you, {currentUser.name}. Your booking for the {bookedPackage} package is confirmed. Check "My Account" for details.
                    </p>
                    <button 
                        onClick={() => { 
                            setBookedPackage(null); 
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
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Preventive Health Checkups</h2>
                    <p className="text-lg text-gray-600 mt-2">Invest in your health today for a better tomorrow.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {packages.map((pkg, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg p-8 flex flex-col border-t-4 border-blue-600">
                            <h3 className="text-2xl font-bold text-gray-800 text-center">{pkg.name}</h3>
                            <p className="text-4xl font-bold text-blue-600 text-center my-4">₹{pkg.price}</p>
                            <ul className="space-y-3 text-gray-600 mb-6 flex-grow">
                                {pkg.features.map((feature, i) => (
                                    <li key={i} className="flex items-center">
                                        <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={() => handleBookPackage(pkg)} 
                                className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition duration-300 mt-auto"
                            >
                                Book Package
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthCheckPage;
