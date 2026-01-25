// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Stethoscope, Calendar, Video, Ambulance, ShieldCheck, BookOpen, HeartPulse } from 'lucide-react';

const HomePage = ({ navigateTo }) => { 
    const services = [
        { img: 'https://tacanow.org/wp-content/uploads/2021/02/finding-a-doctor_photo_1.jpg', title: "Find a Doctor", desc: "Search for the best doctors in your area.", page: "Doctors" },
        { img: 'https://images.pexels.com/photos/4226256/pexels-photo-4226256.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', title: "Book Appointment", desc: "Schedule your visit with a specialist.", page: "Appointments" },
        { img: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', title: "Online Consultancy", desc: "Consult with doctors from your home.", page: "Appointments" },
        { img: 'https://www.adlittle.de/sites/default/files/reports/adl_ambulance_services_-_optimizing_operations_cover.jpg', title: "Ambulance Service", desc: "24/7 emergency ambulance services.", page: "Ambulance" },
        { img: 'https://images.pexels.com/photos/3957987/pexels-photo-3957987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', title: "Health Checkup", desc: "Book comprehensive health check packages.", page: "HealthCheck" },
        { img: 'https://www.austin.org.au/Assets/Images/Library%20Website%20banner%20mobile.png', title: "Health Library", desc: "Access a wealth of health information.", page: "HealthLibrary" },
    ];

    // --- Hero Slider Logic ---
    const slides = [
        {
            image: "https://images.pexels.com/photos/3279197/pexels-photo-3279197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            caption: "Compassionate Care, Every Step of the Way"
        },
        {
            image: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            caption: "Advanced Technology for Accurate Diagnoses"
        },
        {
            image: "https://assets.futuregenerali.in/blogs-image/health/is-the-health-of-your-family-secure-or-at-risk.jpg",
            caption: "Dedicated to the Health of Your Entire Family"
        },
        {
            image: "https://images.pexels.com/photos/7245333/pexels-photo-7245333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            caption: "24/7 Emergency Services When You Need Us Most"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer); // Cleanup on component unmount
    }, [slides.length]);
    // --- End Hero Slider Logic ---

    return (
        <div>
            {/* --- Dynamic Hero Section --- */}
            <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: `url('${slide.image}')` }}
                    >
                        {/* Semi-transparent overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    </div>
                ))}
                
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-4">
                    <h1 className="text-4xl md:text-6xl font-bold uppercase mb-4 transition-all duration-500">
                        {slides[currentSlide].caption}
                    </h1>
                    <p className="text-lg md:text-xl mb-8 max-w-2xl">
                        Providing world-class, compassionate healthcare with a personal touch. Your health is our priority.
                    </p>
                    <button onClick={() => navigateTo('Appointments')} className="bg-rose-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition duration-300 shadow-lg">
                        Book an Appointment
                    </button>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-800">Our Services</h3>
                        <p className="text-gray-600 mt-2">Comprehensive care for every patient.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden" onClick={() => navigateTo(service.page)}>
                                <img src={service.img} alt={service.title} className="w-full h-48 object-cover" />
                                <div className="p-6 text-center">
                                    <h4 className="text-xl font-semibold mb-2">{service.title}</h4>
                                    <p className="text-gray-600">{service.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-white py-20">
                 <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-800">Why Choose Us?</h3>
                        <p className="text-gray-600 mt-2">Your trusted partner in health and wellness.</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <div 
                                className="relative rounded-lg shadow-xl w-full h-80 bg-cover bg-center flex items-center justify-center"
                                style={{ backgroundImage: "url('https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}
                            >
                                <div className="absolute inset-0 bg-blue-800 opacity-50 rounded-lg"></div>
                                <h3 className="relative z-10 text-white text-5xl font-bold">Expert Care</h3>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <ul className="space-y-6">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 mt-1">
                                        <Stethoscope size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold">Experienced Doctors</h4>
                                        <p className="text-gray-600">Our team consists of highly skilled and experienced medical professionals.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 mt-1">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold">Advanced Technology</h4>
                                        <p className="text-gray-600">We use state-of-the-art technology for accurate diagnosis and treatment.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 mt-1">
                                        <HeartPulse size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold">Patient-Centric Care</h4>
                                        <p className="text-gray-600">We prioritize your comfort and well-being at every step of your journey.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
