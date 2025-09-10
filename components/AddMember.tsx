import React, { useState, useRef, useEffect } from 'react';
import type { Member, MembershipPlan, GymProfile } from '../types';
import { PaymentMode } from '../types';
import { calculateExpiryDate, generateNextMemberId } from '../utils/helpers';
import { DEFAULT_AVATAR_URL } from '../constants';
import CameraIcon from './icons/CameraIcon';

// Add QR Code to global window object for TypeScript
declare global {
  interface Window {
    QRCode: any;
  }
}

interface AddMemberProps {
  onAddMember: (member: Member) => void;
  members: Member[];
  plans: MembershipPlan[];
  gymProfile: GymProfile;
}

const AddMember: React.FC<AddMemberProps> = ({ onAddMember, members, plans, gymProfile }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [planId, setPlanId] = useState(plans[0].id);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.UPI);
  const [photoUrl, setPhotoUrl] = useState<string>(DEFAULT_AVATAR_URL);
  const [upiLink, setUpiLink] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  
  const ENTRY_FEE = 200;

  const selectedPlan = plans.find(p => p.id === planId);
  const totalAmount = (selectedPlan?.price || 0) + ENTRY_FEE;

  const handlePaymentModeChange = (mode: PaymentMode) => {
    setPaymentMode(mode);
  };

  // Effect 1: Generate the UPI link string whenever dependencies change
  useEffect(() => {
    if (paymentMode === PaymentMode.UPI && gymProfile.upiId) {
        const payeeName = "Alpha Gym";
        const notes = `New member registration for ${name || 'New Member'}`;
        const newUpiLink = `upi://pay?pa=${gymProfile.upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(notes)}`;
        setUpiLink(newUpiLink);
    } else {
        setUpiLink('');
    }
  }, [paymentMode, planId, name, gymProfile.upiId, totalAmount]);

  // Effect 2: Draw the QR code whenever the upiLink string is ready and the canvas is available
  useEffect(() => {
    if (upiLink && qrCodeRef.current && window.QRCode) {
        window.QRCode.toCanvas(qrCodeRef.current, upiLink, { width: 220, margin: 1 }, (error: any) => {
            if (error) console.error("QR Code generation failed:", error);
        });
    }
  }, [upiLink]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !planId) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!/^\+91\d{10}$/.test(phone)) {
        alert('Please enter a valid phone number in the format +91XXXXXXXXXX.');
        return;
    }

    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;
    
    // The joinDate from input is a 'YYYY-MM-DD' string.
    // We parse it into parts to create a local Date object to avoid timezone issues.
    const [year, month, day] = joinDate.split('-').map(Number);
    const joinDateObj = new Date(year, month - 1, day);

    const expiryDate = calculateExpiryDate(joinDateObj, selectedPlan.durationMonths);
    
    const newMemberId = generateNextMemberId(members);
    
    const newMember: Member = {
      id: `mem_${Date.now()}`,
      memberId: newMemberId,
      name,
      phone,
      email,
      joinDate: joinDateObj.toISOString(),
      membershipExpiry: expiryDate.toISOString(),
      photoUrl: photoUrl,
      payments: [
        {
          id: `pay_${Date.now()}`,
          date: joinDateObj.toISOString(),
          amount: totalAmount,
          planId: selectedPlan.id,
          mode: paymentMode,
        },
      ],
    };

    onAddMember(newMember);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-kanit font-semibold text-white">New Member Registration</h2>

      <div className="flex justify-center">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            className="hidden"
            accept="image/*"
            capture="environment"
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group">
            <img src={photoUrl} alt="Member" className="w-24 h-24 rounded-full object-cover border-4 border-zinc-700 group-hover:border-red-500/70 transition-colors" />
            <div className="absolute bottom-0 right-0 bg-red-600 p-1.5 rounded-full ring-2 ring-black group-hover:bg-red-500 transition-colors">
            <CameraIcon className="w-4 h-4 text-white" />
            </div>
        </button>
      </div>
      
      {/* Personal Details */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-1">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            value={phone} 
            onChange={e => {
                const value = e.target.value;
                if (value.startsWith('+91')) {
                    setPhone(value);
                }
            }}
            pattern="\+91[0-9]{10}"
            title="Phone number must be in the format +91XXXXXXXXXX"
            required 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">Email (Optional)</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label htmlFor="joinDate" className="block text-sm font-medium text-zinc-300 mb-1">Join Date</label>
          <input 
            type="date" 
            id="joinDate" 
            value={joinDate} 
            onChange={e => setJoinDate(e.target.value)} 
            required 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
          />
        </div>
      </div>

      {/* Membership Plan */}
      <div className="space-y-2">
         <label className="block text-sm font-medium text-zinc-300 mb-1">Membership Plan</label>
         <select value={planId} onChange={e => setPlanId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
            {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}</option>
            ))}
         </select>
      </div>

      {/* Payment Details */}
      <div className="space-y-3 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <h3 className="font-kanit text-lg font-semibold text-red-500">Initial Payment</h3>
        <div className="text-sm space-y-2">
            <div className="flex justify-between text-zinc-300">
                <span>Membership Fee:</span>
                <span className="font-semibold text-white">₹{selectedPlan?.price || 0}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
                <span>One-time Entry Fee:</span>
                <span className="font-semibold text-white">₹{ENTRY_FEE}</span>
            </div>
            <hr className="border-zinc-700 !my-2" />
            <div className="flex justify-between text-zinc-200 font-bold text-base">
                <span>Total Amount to be Paid:</span>
                <span className="text-white">₹{totalAmount}</span>
            </div>
        </div>
         <div className="!mt-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Mode</label>
            <div className="flex gap-4">
                {(Object.values(PaymentMode)).map(mode => (
                    <button type="button" key={mode} onClick={() => handlePaymentModeChange(mode)} className={`flex-1 py-2 px-4 rounded-lg border text-sm font-semibold transition-colors ${paymentMode === mode ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}>
                        {mode}
                    </button>
                ))}
            </div>
             {paymentMode === PaymentMode.UPI && (
                <div className="mt-4 text-center bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                    {gymProfile.upiId ? (
                       <>
                            <p className="text-sm text-zinc-300 mb-3">Scan the QR code to pay</p>
                            <canvas ref={qrCodeRef} width="220" height="220" className="mx-auto bg-white p-2 rounded-md shadow-lg"></canvas>
                       </>
                    ) : (
                        <div className="text-sm text-yellow-400 p-2 rounded-md bg-yellow-900/50 border border-yellow-700">
                            <p className='font-semibold'>UPI ID not found.</p>
                            <p className='text-xs mt-1'>Please add your UPI ID in the Profile section to generate QR codes.</p>
                        </div>
                    )}
                </div>
             )}
         </div>
      </div>
      
      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg font-kanit">
        Register Member
      </button>
    </form>
  );
};

export default AddMember;