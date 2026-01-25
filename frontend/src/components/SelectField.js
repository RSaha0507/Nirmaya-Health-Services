// src/components/SelectField.js
import React from 'react';

const SelectField = ({ icon, name, value, onChange, options, ...props }) => (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">{icon}</span>
        <select name={name} value={value} onChange={onChange} {...props} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none">
            <option value="" disabled>{`Select ${name.charAt(0).toUpperCase() + name.slice(1)}`}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default SelectField;