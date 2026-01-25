// src/pages/AboutPage.js
import React from 'react';

const AboutPage = () => { 
    return (
        <div className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800">About Nirmaya Health</h2>
                    <p className="text-lg text-gray-600 mt-2">Committed to Excellence in Healthcare</p>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
                    <div className="md:w-1/2">
                        <img src="https://placehold.co/600x400/3B82F6/FFFFFF?text=Our+Facility" alt="Hospital Facility" className="rounded-lg shadow-xl w-full" />
                    </div>
                    <div className="md:w-1/2">
                        <h3 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to Our State-of-the-Art Facility</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Nirmaya Health was founded with a vision to create a healthcare institution that combines the highest standard of medical excellence with patient-centered care. Our hospital is equipped with the latest medical technologies and staffed by a team of dedicated and compassionate healthcare professionals.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            We are committed to providing comprehensive healthcare services to our community, ensuring that every patient receives the best possible treatment and support.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold text-blue-600 mb-4">Our Mission</h3>
                        <p className="text-gray-600 leading-relaxed">
                            To provide exceptional and compassionate healthcare services, accessible to all. We are dedicated to improving the health and well-being of our community through continuous innovation, education, and a commitment to quality and safety.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold text-blue-600 mb-4">Our Vision</h3>
                        <p className="text-gray-600 leading-relaxed">
                            To be a leading healthcare institution, recognized for our excellence in patient care, medical research, and education. We aspire to be the hospital of choice for patients, physicians, and employees, setting new standards in healthcare delivery.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
