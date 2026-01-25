// src/pages/DepartmentsPage.js
import React from 'react';
import { Stethoscope } from 'lucide-react';

const DepartmentsPage = ({ doctors }) => {
    // Group doctors by department
    const departments = doctors.reduce((acc, doctor) => {
        const dept = doctor.department;
        if (!acc[dept]) {
            acc[dept] = [];
        }
        acc[dept].push(doctor);
        return acc;
    }, {});

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800">Departments & Specialties</h2>
                    <p className="text-lg text-gray-600 mt-2">Comprehensive care across all medical fields.</p>
                </div>

                <div className="space-y-12">
                    {Object.keys(departments).sort().map(deptName => (
                        <div key={deptName} className="bg-white p-8 rounded-lg shadow-lg">
                            <h3 className="text-3xl font-bold text-blue-600 mb-6 border-b pb-4 flex items-center">
                                <Stethoscope className="mr-4" /> {deptName}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {departments[deptName].map(doctor => (
                                    <div key={doctor.id} className="p-4 border rounded-md">
                                        <p className="font-bold text-lg text-gray-800">{doctor.name}</p>
                                        <p className="text-gray-600">{doctor.specialty}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DepartmentsPage;
