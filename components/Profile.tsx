import React, { useState, useEffect } from 'react';
import type { GymProfile } from '../types';

interface ProfileProps {
  profile: GymProfile;
  onSave: (profile: GymProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<GymProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500";
  const labelClass = "block text-sm font-medium text-zinc-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-kanit font-semibold text-white">Gym Owner Profile</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="upiId" className={labelClass}>UPI ID</label>
          <input type="text" id="upiId" name="upiId" value={formData.upiId} onChange={handleChange} className={inputClass} placeholder="your-upi-id@okhdfcbank" />
        </div>
        <div>
          <label htmlFor="whatsappNumber" className={labelClass}>WhatsApp Number</label>
          <input type="tel" id="whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className={inputClass} placeholder="+919876543210" />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email Address</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="owner@gym.com" />
        </div>
        <div>
          <label htmlFor="bankAccount" className={labelClass}>Bank Account Number</label>
          <input type="text" id="bankAccount" name="bankAccount" value={formData.bankAccount} onChange={handleChange} className={inputClass} placeholder="123456789012" />
        </div>
        <div>
          <label htmlFor="ifscCode" className={labelClass}>IFSC Code</label>
          <input type="text" id="ifscCode" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className={inputClass} placeholder="HDFC0001234" />
        </div>
      </div>
      
      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg font-kanit flex items-center justify-center">
        {isSaved ? 'Saved!' : 'Save Profile'}
      </button>
    </form>
  );
};

export default Profile;
