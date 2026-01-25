// src/pages/ForgotPasswordPage.js (NEW FILE)
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import InputField from '../components/InputField';

const ForgotPasswordPage = ({ handlePasswordReset }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handlePasswordReset(email);
    };

    return (
        <div className="py-20 bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
                    <p className="text-gray-600 mt-2">Enter your email to receive a password reset link.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField icon={<Mail />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Send Reset Link</button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;