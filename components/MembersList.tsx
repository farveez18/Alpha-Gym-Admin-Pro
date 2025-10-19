import React, { useState, useMemo } from 'react';
import type { Member } from '../types';
import { getDaysUntilExpiry, formatDate } from '../utils/helpers';
import SearchIcon from './icons/SearchIcon';

interface MembersListProps {
  members: Member[];
  onSelectMember: (memberId: string) => void;
}

const MemberCard: React.FC<{ member: Member; onSelect: () => void }> = ({ member, onSelect }) => {
  const daysUntilExpiry = getDaysUntilExpiry(member.membershipExpiry);
  const status = daysUntilExpiry < 0 ? 'Expired' : 'Active';
  const statusColor = status === 'Expired' ? 'bg-red-600' : 'bg-green-600';

  return (
    <li
      onClick={onSelect}
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center space-x-4 cursor-pointer hover:bg-zinc-800 transition-colors"
    >
      <img src={member.photoUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700" />
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
            <p className="font-bold font-kanit text-lg text-white">{member.name}</p>
            <p className="text-xs font-mono text-zinc-500">{member.memberId}</p>
        </div>
        <p className="text-sm text-zinc-400">{member.phone}</p>
        <p className="text-xs text-zinc-500">
          Expires on: {formatDate(member.membershipExpiry)}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor} text-white`}>
          {status}
        </span>
        {status === 'Active' && <span className="text-xs text-zinc-400 mt-1">{daysUntilExpiry} days left</span>}
      </div>
    </li>
  );
};

const MembersList: React.FC<MembersListProps> = ({ members, onSelectMember }) => {
  type FilterStatus = 'all' | 'active' | 'inactive';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const filteredMembers = useMemo(() => {
    return members
      .filter(member => {
        const daysUntilExpiry = getDaysUntilExpiry(member.membershipExpiry);
        if (filterStatus === 'active') {
            return daysUntilExpiry >= 0;
        }
        if (filterStatus === 'inactive') {
            return daysUntilExpiry < 0;
        }
        return true; // for 'all'
      })
      .filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        member.memberId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  }, [members, searchTerm, filterStatus]);
  
  const filterButtons: { label: string, status: FilterStatus }[] = [
      { label: 'All Members', status: 'all' },
      { label: 'Active', status: 'active' },
      { label: 'Inactive', status: 'inactive' },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, phone, or ID..."
          aria-label="Search members"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-zinc-500"/>
        </div>
      </div>
      
      <div className="flex gap-2">
        {filterButtons.map(({ label, status }) => {
            const isActive = status === filterStatus;
            return (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                    isActive
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                >
                    {label}
                </button>
            );
        })}
      </div>

      {filteredMembers.length > 0 ? (
        <ul className="space-y-3">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} onSelect={() => onSelectMember(member.id)} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-zinc-500 pt-8">No members found for the selected filter.</p>
      )}
    </div>
  );
};

export default MembersList;