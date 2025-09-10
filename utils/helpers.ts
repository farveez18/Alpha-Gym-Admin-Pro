import type { Member, GymProfile, MembershipPlan } from '../types';

export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calculateExpiryDate = (startDate: Date, durationMonths: number): Date => {
  const expiryDate = new Date(startDate);
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  return expiryDate;
};

export const getDaysUntilExpiry = (expiryDate: string): number => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const generateNextMemberId = (members: Member[]): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // e.g., '24'
  const prefix = `A${year}`;

  const currentYearMembers = members.filter(m => m.memberId && m.memberId.startsWith(prefix));

  let lastNumber = 0;
  if (currentYearMembers.length > 0) {
    // Find the highest number among members of the current year
    lastNumber = Math.max(...currentYearMembers.map(m => parseInt(m.memberId.slice(3), 10)));
  }

  const nextNumber = lastNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  
  return `${prefix}${paddedNumber}`;
};

export const generateRenewalLinks = (
  member: Member,
  gymProfile: GymProfile,
  days: number,
  plans: MembershipPlan[]
): { whatsapp: string; sms: string } => {
  const expiryDate = new Date(member.membershipExpiry);
  const dayOfWeek = expiryDate.toLocaleDateString('en-IN', { weekday: 'long' });

  const lastPayment = [...member.payments].pop();
  const plan = lastPayment ? plans.find(p => p.id === lastPayment.planId) : plans[0];
  const renewalAmount = plan?.price || 1000;

  const renewalLink = gymProfile.upiId
    ? `upi://pay?pa=${gymProfile.upiId}&pn=Alpha%20Fitness%20Zone&am=${renewalAmount}&cu=INR&tn=Membership%20Renewal`
    : 'Please contact the gym to renew.';

  const message = `🚨 Alpha Fitness Zone Alert 🚨

Hi ${member.name}, your gym access expires this ${dayOfWeek}!

Avoid the hassle of re-joining and a potential price increase. Lock in your current rate now!

Renew here to keep your fitness journey on track:
${renewalLink}

Don't let your progress slip away! 🔥`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = member.phone.replace('+', '');

  return {
    whatsapp: `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
    sms: `sms:${member.phone}?body=${encodedMessage}`,
  };
};