// src/pages/SignUpPage.js
import React, { useState } from 'react';
import { User, Mail, Lock, Phone } from 'lucide-react'; // Added 'Phone' import
import InputField from '../components/InputField';

const SignUpPage = ({ navigateTo, handleSignUp }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSignUp({ name, email, password, phone });
    };
    
    return (
        <div className="py-20 bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Create an Account</h2>
                    <p className="text-gray-600 mt-2">Join us to manage your health with ease.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField icon={<User />} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
                    <InputField icon={<Mail />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
                    <InputField icon={<Lock />} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" required />
                    <InputField icon={<Phone />} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number " required />
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Sign Up</button>
                </form>
                <p className="text-center text-gray-600 mt-6">
                    Already have an account? <button onClick={() => navigateTo('Login')} className="text-blue-600 hover:underline font-semibold">Login</button>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;