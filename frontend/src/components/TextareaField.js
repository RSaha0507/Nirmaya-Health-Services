// src/components/TextareaField.js
import React from 'react';

const TextareaField = ({ icon, ...props }) => (
    <div className="relative">
        <span className="absolute top-4 left-0 flex items-center pl-3 text-gray-400">{icon}</span>
        <textarea {...props} rows="4" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"></textarea>
    </div>
);

export default TextareaField;