// src/pages/DepartmentDetailPage.js
import React from 'react';
import { Stethoscope, ChevronRight } from 'lucide-react';

const DepartmentDetailPage = ({ department, doctors, navigateTo }) => {
    if (!department) {
        return <div className="py-20 text-center">Loading department details...</div>;
    }

    const departmentDoctors = doctors.filter(doc => doc.department === department.name);

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                {/* Department Header */}
                <div className="text-center mb-12 border-b-2 border-blue-200 pb-8">
                    <h1 className="text-5xl font-bold text-blue-600 mb-4">{department.name}</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">{department.description}</p>
                </div>

                {/* Specialties Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Specialties</h2>
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {department.specialties.map(spec => (
                                <li key={spec} className="flex items-center text-gray-700 text-lg">
                                    <ChevronRight size={20} className="text-blue-500 mr-3 flex-shrink-0" />
                                    {spec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Doctors Section */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Doctors in {department.name}</h2>
                    {departmentDoctors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {departmentDoctors.map((doctor) => (
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
                        <div className="text-center text-gray-500 mt-12 bg-white p-10 rounded-lg shadow-md">
                            <p>There are currently no doctors listed for this department.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetailPage;
