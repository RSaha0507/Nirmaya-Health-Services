// src/pages/HealthLibrary.js
import React from 'react';

const HealthLibrary = () => { 
    const articles = [
        { title: "Understanding Cardiovascular Diseases", category: "Cardiology", summary: "An overview of common heart conditions, their causes, symptoms, and prevention.", image: "https://placehold.co/400x250/E9F5FF/3B82F6?text=Heart+Health" },
        { title: "The Importance of a Balanced Diet", category: "Nutrition", summary: "Learn how a balanced diet can improve your overall health and reduce the risk of chronic diseases.", image: "https://placehold.co/400x250/E9F5FF/3B82F6?text=Nutrition" },
        { title: "Managing Stress for Better Mental Health", category: "Mental Health", summary: "Effective techniques and lifestyle changes to manage stress and improve your mental well-being.", image: "https://placehold.co/400x250/E9F5FF/3B82F6?text=Mental+Health" },
        { title: "Exercise for a Healthy Lifestyle", category: "Fitness", summary: "Discover the benefits of regular physical activity and how to incorporate it into your daily routine.", image: "https://placehold.co/400x250/E9F5FF/3B82F6?text=Fitness" },
        { title: "Children's Health: A Parent's Guide", category: "Pediatrics", summary: "Essential information on child development, vaccinations, and common childhood illnesses.", image: "https://placehold.co/400x250/E9F5FF/3B82F6?text=Pediatrics" },
        { title: "Skin Care Basics for All Ages", category: "Dermatology", summary: "Tips for maintaining healthy skin, protecting it from sun damage, and addressing common skin issues.", image: "https://placehold.co/400x250/E9F5FF/3B82F6?text=Dermatology" },
    ];

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Health Library</h2>
                    <p className="text-lg text-gray-600 mt-2">Your trusted source for health information.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                            <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <p className="text-sm text-blue-600 font-semibold mb-2">{article.category}</p>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{article.title}</h3>
                                <p className="text-gray-600 mb-4">{article.summary}</p>
                                <a href="#" className="font-semibold text-blue-600 hover:text-blue-800">Read More &rarr;</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HealthLibrary;
