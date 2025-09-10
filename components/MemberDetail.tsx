import React, { useState, useRef, useEffect } from 'react';
import type { Member, Payment, GymProfile, MembershipPlan } from '../types';
import { PaymentMode } from '../types';
import { formatDate, formatCurrency, calculateExpiryDate, getDaysUntilExpiry, generateRenewalLinks } from '../utils/helpers';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { MessageIcon } from './icons/MessageIcon';
import CameraIcon from './icons/CameraIcon';

interface MemberDetailProps {
  member: Member;
  onUpdateMember: (member: Member) => void;
  gymProfile: GymProfile;
  plans: MembershipPlan[];
}

// Add QR Code to global window object for TypeScript
declare global {
  interface Window {
    QRCode: any;
  }
}

const InvoiceModal: React.FC<{ payment: Payment; member: Member; onClose: () => void; plans: MembershipPlan[] }> = ({ payment, member, onClose, plans }) => {
    const plan = plans.find(p => p.id === payment.planId);

    const handlePrint = () => window.print();
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white text-black p-6 rounded-lg w-full max-w-sm relative @media print:shadow-none @media print:m-0 @media print:rounded-none">
                <div id="invoice-content">
                    <h2 className="text-2xl font-bold font-kanit text-center mb-2">GYM ADMIN PRO</h2>
                    <p className="text-center text-sm text-zinc-600 mb-6">Payment Invoice</p>
                    <div className="text-sm space-y-2 mb-6">
                        <p><strong>Member:</strong> {member.name} ({member.memberId})</p>
                        <p><strong>Phone:</strong> {member.phone}</p>
                        <p><strong>Payment ID:</strong> {payment.id}</p>
                        <p><strong>Date:</strong> {formatDate(payment.date)}</p>
                    </div>
                    <table className="w-full text-left mb-6">
                        <thead>
                            <tr className="border-b border-zinc-300">
                                <th className="py-2">Description</th>
                                <th className="py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-2">{plan?.name} Membership</td>
                                <td className="py-2 text-right">{formatCurrency(payment.amount)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-zinc-500 font-bold">
                                <td className="py-2">Total Paid ({payment.mode})</td>
                                <td className="py-2 text-right">{formatCurrency(payment.amount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <p className="text-xs text-zinc-500 text-center">Thank you for your payment!</p>
                </div>
                 <div className="flex gap-2 mt-6 @media print:hidden">
                    <button onClick={handlePrint} className="flex-1 bg-zinc-800 text-white py-2 rounded-lg">Print</button>
                    <button onClick={onClose} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Close</button>
                </div>
            </div>
        </div>
    );
};


const MemberDetail: React.FC<MemberDetailProps> = ({ member, onUpdateMember, gymProfile, plans }) => {
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0].id);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.UPI);
  const [invoicePayment, setInvoicePayment] = useState<Payment | null>(null);
  const [upiLink, setUpiLink] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  const daysUntilExpiry = getDaysUntilExpiry(member.membershipExpiry);
  const status = daysUntilExpiry < 0 ? 'Expired' : 'Active';
  const statusColor = status === 'Expired' ? 'text-red-500' : 'text-green-500';

  const handlePaymentModeChange = (mode: PaymentMode) => {
    setPaymentMode(mode);
  };

  const handleCloseModal = () => {
    setShowRenewModal(false);
  };

  // Effect 1: Generate the UPI link string
  useEffect(() => {
    if (showRenewModal && paymentMode === PaymentMode.UPI && gymProfile.upiId) {
        const selectedPlan = plans.find(p => p.id === selectedPlanId);
        if (!selectedPlan) {
          setUpiLink('');
          return;
        };

        const amount = selectedPlan.price;
        const payeeName = "Alpha Gym";
        const notes = `Membership renewal for ${member.name}`;
        
        const newUpiLink = `upi://pay?pa=${gymProfile.upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(notes)}`;
        setUpiLink(newUpiLink);
    } else {
        setUpiLink('');
    }
  }, [showRenewModal, paymentMode, selectedPlanId, gymProfile.upiId, member.name, plans]);

  // Effect 2: Draw the QR code
  useEffect(() => {
    if (showRenewModal && upiLink && qrCodeRef.current && window.QRCode) {
        window.QRCode.toCanvas(qrCodeRef.current, upiLink, { width: 220, margin: 1 }, (error: any) => {
            if (error) console.error("QR Code generation failed:", error);
        });
    }
  }, [showRenewModal, upiLink]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotoUrl = reader.result as string;
        const updatedMember = { ...member, photoUrl: newPhotoUrl };
        onUpdateMember(updatedMember);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleRenew = () => {
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    if (!selectedPlan) return;

    const lastExpiry = new Date(member.membershipExpiry);
    const now = new Date();
    // Start new plan from today if expired, otherwise from last expiry date
    const startDate = lastExpiry > now ? lastExpiry : now;
    const newExpiryDate = calculateExpiryDate(startDate, selectedPlan.durationMonths);

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      date: new Date().toISOString(),
      amount: selectedPlan.price,
      planId: selectedPlan.id,
      mode: paymentMode,
    };
    
    const updatedMember = {
      ...member,
      membershipExpiry: newExpiryDate.toISOString(),
      payments: [...member.payments, newPayment],
    };

    onUpdateMember(updatedMember);
    handleCloseModal();
  };
  

  const sendReminder = (platform: 'whatsapp' | 'sms') => {
      const days = daysUntilExpiry > 0 ? daysUntilExpiry : 0;
      const links = generateRenewalLinks(member, gymProfile, days, plans);
      window.open(links[platform], '_blank');
  };

  return (
    <div className="space-y-6">
        {invoicePayment && <InvoiceModal payment={invoicePayment} member={member} onClose={() => setInvoicePayment(null)} plans={plans} />}
      {/* Member Profile */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col items-center text-center">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            className="hidden"
            accept="image/*"
            capture="environment"
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group mb-4">
            <img src={member.photoUrl} alt={member.name} className="w-24 h-24 rounded-full object-cover border-4 border-red-500 group-hover:opacity-80 transition-opacity" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300">
                <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </button>

        <h2 className="text-2xl font-kanit font-bold text-white">{member.name}</h2>
        <p className="text-lg text-red-500 font-semibold font-mono tracking-wider mb-1">{member.memberId}</p>
        <p className="text-zinc-400">{member.phone}</p>
        {member.email && <p className="text-sm text-zinc-500">{member.email}</p>}
        <div className="mt-4 bg-zinc-800 px-4 py-2 rounded-lg">
            <p className="text-sm text-zinc-300">Membership Status: <span className={`font-bold ${statusColor}`}>{status}</span></p>
            <p className="text-xs text-zinc-400">
                {status === 'Expired' ? `Expired on ${formatDate(member.membershipExpiry)}` : `Expires on ${formatDate(member.membershipExpiry)} (${daysUntilExpiry} days left)`}
            </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button onClick={() => setShowRenewModal(true)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors font-kanit">
          Renew / Record Payment
        </button>
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-3">
             <button onClick={() => sendReminder('whatsapp')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <WhatsAppIcon className="w-5 h-5"/> Reminder
            </button>
             <button onClick={() => sendReminder('sms')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <MessageIcon className="w-5 h-5"/> Reminder
            </button>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-xl font-kanit font-semibold text-white mb-3">Payment History</h3>
        <ul className="space-y-3">
          {[...member.payments].reverse().map(payment => {
            const plan = plans.find(p => p.id === payment.planId);
            return (
              <li key={payment.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-zinc-200">{plan?.name || 'Plan'}</p>
                  <p className="text-xs text-zinc-400">{formatDate(payment.date)} via {payment.mode}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-white">{formatCurrency(payment.amount)}</p>
                    <button onClick={() => setInvoicePayment(payment)} className="text-xs text-red-500 hover:underline">Generate Invoice</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-sm border border-zinc-700">
                <h3 className="text-2xl font-kanit font-semibold text-white mb-4">Renew Membership</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Select Plan</label>
                        <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            {plans.map(plan => (
                                <option key={plan.id} value={plan.id}>{plan.name} - {formatCurrency(plan.price)}</option>
                            ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Mode</label>
                        <div className="flex gap-4">
                            {(Object.values(PaymentMode)).map(mode => (
                                <button type="button" key={mode} onClick={() => handlePaymentModeChange(mode)} className={`flex-1 py-2 px-4 rounded-lg border text-sm font-semibold transition-colors ${paymentMode === mode ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                     </div>
                     
                     {paymentMode === PaymentMode.UPI && (
                        <div className="text-center bg-zinc-800 p-4 rounded-lg border border-zinc-700">
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

                     <div className="flex gap-2 pt-4">
                        <button onClick={handleCloseModal} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-lg">Cancel</button>
                        <button onClick={handleRenew} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg">Confirm Payment</button>
                     </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetail;