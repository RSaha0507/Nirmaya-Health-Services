// src/pages/AmbulancePage.js
import React from 'react';
import { Phone } from 'lucide-react';

const AmbulancePage = () => { 
    return (
        <div className="py-20">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2"><img src="https://placehold.co/600x450/3B82F6/FFFFFF?text=Emergency+Services" alt="Ambulance" className="rounded-lg shadow-xl w-full" /></div>
                    <div className="md:w-1/2 text-center md:text-left">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">24/7 Ambulance Services</h2><p className="text-lg text-gray-600 mb-6">In case of a medical emergency, our fully equipped ambulances are ready to respond immediately. Our trained paramedics provide critical care on the way to the hospital.</p>
                        <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow-md"><h3 className="text-2xl font-bold text-red-700">Emergency Hotline</h3><p className="text-4xl font-bold text-red-600 my-3 tracking-wider flex items-center justify-center md:justify-start"><Phone className="mr-3" /> 1800-123-4567</p><p className="text-gray-700">Available 24 hours a day, 7 days a week.</p></div>
                         <button className="mt-8 bg-red-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-red-700 transition duration-300 shadow-lg w-full md:w-auto">Call Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AmbulancePage;