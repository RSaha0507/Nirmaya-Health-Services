// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Mail, Lock, Key } from 'lucide-react';
import InputField from '../components/InputField';

const LoginPage = ({ navigateTo, handleLogin, handleOtpSubmit, showOtpInput }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        handleLogin({ email, password });
    };

    const handleOtpVerification = (e) => {
        e.preventDefault();
        handleOtpSubmit(otp);
    };

    return (
        <div className="py-20 bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                {!showOtpInput ? (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
                            <p className="text-gray-600 mt-2">Sign in to continue.</p>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <InputField icon={<Mail />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
                            <InputField icon={<Lock />} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                            <div className="text-right"><button type="button" onClick={() => navigateTo('ForgotPassword')} className="text-sm text-blue-600 hover:underline">Forgot Password?</button></div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Login</button>
                        </form>
                        <p className="text-center text-gray-600 mt-6">Don't have an account? <button onClick={() => navigateTo('SignUp')} className="text-blue-600 hover:underline font-semibold">Sign Up</button></p>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Enter Verification Code</h2>
                            <p className="text-gray-600 mt-2">A 6-digit code was sent to your registered phone number.</p>
                        </div>
                        <form onSubmit={handleOtpVerification} className="space-y-6">
                            <InputField icon={<Key />} type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-Digit OTP" required />
                            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">Verify Code</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;