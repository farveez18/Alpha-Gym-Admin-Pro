

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Member } from '../types';
import { getDaysUntilExpiry, formatCurrency, formatDate } from '../utils/helpers';
import { BellIcon } from './icons/BellIcon';

interface DashboardProps {
  members: Member[];
  onExpiryCardClick: (days: number) => void;
}

const ExpiryCard: React.FC<{ title: string; members: Member[]; bgColor: string; onClick: () => void; }> = ({ title, members, bgColor, onClick }) => (
    <button onClick={onClick} className={`w-full text-left bg-zinc-900 p-4 rounded-lg border border-zinc-800 transition-colors hover:border-red-500/50 ${members.length > 0 ? '' : 'opacity-50'}`}>
        <h3 className="font-kanit text-lg font-semibold mb-3 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-3 ${bgColor}`}></span>
            {title}
        </h3>
        {members.length > 0 ? (
            <ul className="space-y-2">
                {members.map(member => (
                    <li key={member.id} className="text-sm text-zinc-300 flex justify-between items-center">
                        <span>{member.name}</span>
                        <span className="text-xs text-zinc-400">{formatDate(member.membershipExpiry)}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-zinc-500">No members found.</p>
        )}
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ members, onExpiryCardClick }) => {
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    members.forEach(member => {
      member.payments.forEach(payment => {
        years.add(new Date(payment.date).getFullYear());
      });
    });
    if (years.size === 0) {
        years.add(new Date().getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [members]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const currentYear = new Date().getFullYear();
    return availableYears.includes(currentYear) ? currentYear : (availableYears[0] || currentYear);
  });

  const revenueData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = new Array(12).fill(0);

    members.forEach(member => {
      member.payments.forEach(payment => {
        const paymentDate = new Date(payment.date);
        if (paymentDate.getFullYear() === selectedYear) {
            const month = paymentDate.getMonth();
            monthlyRevenue[month] += payment.amount;
        }
      });
    });

    return monthNames.map((name, index) => ({
      name,
      revenue: monthlyRevenue[index],
    }));
  }, [members, selectedYear]);

  const expiringMembers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in3Days: Member[] = [];
    const in7Days: Member[] = [];
    const in10Days: Member[] = [];

    members.forEach(member => {
      const days = getDaysUntilExpiry(member.membershipExpiry);
      if (days >= 0 && days <= 3) {
        in3Days.push(member);
      } else if (days > 3 && days <= 7) {
        in7Days.push(member);
      } else if (days > 7 && days <= 10) {
        in10Days.push(member);
      }
    });

    return { in3Days, in7Days, in10Days };
  }, [members]);
  
  const totalRevenue = revenueData.reduce((acc, item) => acc + item.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-kanit font-semibold text-white mb-1">Revenue Overview</h2>
          <p className="text-zinc-400">Total Revenue in {selectedYear}: <span className="font-bold text-red-500">{formatCurrency(totalRevenue)}</span></p>
        </div>
        {availableYears.length > 0 && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            aria-label="Select year for revenue overview"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" tick={{ fill: '#a1a1aa' }} fontSize={12} interval={0} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: '#a1a1aa' }} fontSize={12} tickFormatter={(value) => `${formatCurrency(Number(value) / 1000)}k`} />
            <Tooltip
                cursor={{fill: 'rgba(239, 68, 68, 0.1)'}}
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff' }} 
                formatter={(value) => formatCurrency(Number(value))}
            />
            <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]}>
                {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? '#ef4444' : '#4b5563'}/>
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h2 className="text-2xl font-kanit font-semibold text-white mb-4 flex items-center"><BellIcon className="w-6 h-6 mr-2 text-red-500"/>Membership Renewals</h2>
        <div className="space-y-4">
            <ExpiryCard title="Expiring in 3 Days" members={expiringMembers.in3Days} bgColor="bg-red-500" onClick={() => onExpiryCardClick(3)} />
            <ExpiryCard title="Expiring in 7 Days" members={expiringMembers.in7Days} bgColor="bg-yellow-500" onClick={() => onExpiryCardClick(7)} />
            <ExpiryCard title="Expiring in 10 Days" members={expiringMembers.in10Days} bgColor="bg-blue-500" onClick={() => onExpiryCardClick(10)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
