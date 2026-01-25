// src/pages/PathologyPage.js
import React from 'react';
import { pathologyData } from '../data/pathology'; // Import the specific department data
import { ChevronRight, Microscope } from 'lucide-react';

const PathologyPage = ({ doctors, navigateTo }) => {
    const { name, description, specialties, servicesOffered, bannerImage } = pathologyData;
    const departmentDoctors = doctors.filter(doc => doc.department === name);

    return (
        <div className="bg-gray-50">
            {/* Hero Banner */}
            <section 
                className="relative h-80 bg-cover bg-center flex items-center justify-center text-white"
                style={{ backgroundImage: `url('${bannerImage}')` }}
            >
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10 text-center">
                    <h1 className="text-5xl font-bold">{name}</h1>
                    <p className="text-xl mt-2">Precision Diagnostics, Definitive Answers</p>
                </div>
            </section>

            <div className="py-20 container mx-auto px-6">
                {/* Department Overview */}
                <section className="mb-16 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">About Our {name} Department</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">{description}</p>
                </section>

                {/* Specialties Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Specialties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {specialties.map(spec => (
                            <div key={spec.name} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <div className="flex items-center mb-3">
                                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                                        <Microscope className="text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">{spec.name}</h3>
                                </div>
                                <p className="text-gray-600">{spec.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Services Offered Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Services We Offer</h2>
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {servicesOffered.map(service => (
                                <li key={service} className="flex items-center text-gray-700 text-lg">
                                    <ChevronRight size={20} className="text-blue-500 mr-3 flex-shrink-0" />
                                    {service}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Pathologists Section */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Pathologists</h2>
                    {departmentDoctors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {departmentDoctors.map((doctor) => (
                                <div key={doctor.id} className="bg-white rounded-lg shadow-lg overflow-hidden text-center transform hover:-translate-y-2 transition-transform duration-300">
                                    <img src={doctor.image || 'https://placehold.co/300x300/E9F5FF/3B82F6?text=No+Image'} alt={doctor.name} className="w-full h-64 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                                        <p className="text-blue-600 font-semibold mt-1">{doctor.specialty}</p>
                                        {/* No booking button for pathology */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-12 bg-white p-10 rounded-lg shadow-md">
                            <p>There are currently no pathologists listed for this department.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PathologyPage;
