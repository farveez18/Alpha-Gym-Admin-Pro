import React from 'react';
import type { Member, GymProfile, MembershipPlan } from '../types';
import { formatDate, generateRenewalLinks } from '../utils/helpers';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { MessageIcon } from './icons/MessageIcon';

interface ExpiringMembersProps {
  members: Member[];
  days: number;
  gymProfile: GymProfile;
  plans: MembershipPlan[];
}

const ExpiringMemberCard: React.FC<{ member: Member; days: number; gymProfile: GymProfile, plans: MembershipPlan[] }> = ({ member, days, gymProfile, plans }) => {
  
  const handleReminder = (platform: 'whatsapp' | 'sms') => {
    const links = generateRenewalLinks(member, gymProfile, days, plans);
    window.open(links[platform], '_blank');
  };

  return (
    <li className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col space-y-3">
        <div className="flex items-center space-x-4">
            <img src={member.photoUrl} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700" />
            <div className="flex-1">
                <p className="font-bold font-kanit text-lg text-white">{member.name}</p>
                <p className="text-sm text-zinc-400">{member.phone}</p>
                <p className="text-xs text-zinc-500">
                Expires on: {formatDate(member.membershipExpiry)}
                </p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleReminder('whatsapp')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                <WhatsAppIcon className="w-4 h-4"/> WhatsApp
            </button>
            <button onClick={() => handleReminder('sms')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                <MessageIcon className="w-4 h-4"/> SMS
            </button>
        </div>
    </li>
  );
};

const ExpiringMembers: React.FC<ExpiringMembersProps> = ({ members, days, gymProfile, plans }) => {
  return (
    <div className="space-y-4">
        {members.length > 0 ? (
            <ul className="space-y-3">
            {members.map(member => (
                <ExpiringMemberCard key={member.id} member={member} days={days} gymProfile={gymProfile} plans={plans} />
            ))}
            </ul>
        ) : (
            <p className="text-center text-zinc-500 pt-8">No members are expiring in this period.</p>
        )}
    </div>
  );
};

export default ExpiringMembers;