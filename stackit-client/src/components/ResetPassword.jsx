import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    try {
      await resetPassword(email);
      toast.success("Reset link sent! Check your email.");
      setEmail('');
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reset link.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-20 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      <input
        type="email"
        className="w-full border px-3 py-2 mb-3 rounded"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleReset}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        Send Reset Link
      </button>
    </div>
  );
};

export default ResetPassword;
