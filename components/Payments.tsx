import React, { useState, useMemo } from 'react';
import type { Member, MembershipPlan, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import DownloadIcon from './icons/DownloadIcon';

// Add type declaration for jsPDF libraries loaded from CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

interface PaymentsProps {
  members: Member[];
  plans: MembershipPlan[];
}

interface EnrichedPayment extends Payment {
  memberName: string;
  memberId: string;
  memberPhotoUrl: string;
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Payments: React.FC<PaymentsProps> = ({ members, plans }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  
  const allPayments = useMemo<EnrichedPayment[]>(() => {
    return members
      .flatMap(member => 
        member.payments.map(payment => ({
          ...payment,
          memberName: member.name,
          memberId: member.memberId,
          memberPhotoUrl: member.photoUrl,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [members]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allPayments.forEach(payment => {
      years.add(new Date(payment.date).getFullYear());
    });
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [allPayments]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const currentYear = new Date().getFullYear();
    return availableYears.includes(currentYear) ? currentYear : (availableYears[0] || currentYear);
  });

  const monthlyRevenue = useMemo(() => {
    const revenueByMonth = new Array(12).fill(0);
    allPayments.forEach(payment => {
      const paymentDate = new Date(payment.date);
      if (paymentDate.getFullYear() === selectedYear) {
        const month = paymentDate.getMonth();
        revenueByMonth[month] += payment.amount;
      }
    });
    return revenueByMonth;
  }, [allPayments, selectedYear]);

  const filteredPayments = useMemo(() => {
    const yearFiltered = allPayments.filter(p => new Date(p.date).getFullYear() === selectedYear);
    if (selectedMonth === 'all') {
      return yearFiltered;
    }
    return yearFiltered.filter(payment => new Date(payment.date).getMonth() === selectedMonth);
  }, [allPayments, selectedMonth, selectedYear]);

  const totalRevenueForSelectedYear = useMemo(() => monthlyRevenue.reduce((a, b) => a + b, 0), [monthlyRevenue]);
  
  const getFilenameAndTitle = () => {
    const period = selectedMonth === 'all' 
      ? `All_${selectedYear}` 
      : `${monthNames[selectedMonth]}_${selectedYear}`;
    
    const title = `Payments for ${selectedMonth === 'all' 
      ? `All of ${selectedYear}` 
      : `${monthNames[selectedMonth]} ${selectedYear}`}`;

    const filename = `gym_payments_${period}`;
    return { filename, title };
  };

  const handleDownloadCSV = () => {
    const { filename } = getFilenameAndTitle();
    const headers = ['Payment ID', 'Date', 'Member ID', 'Member Name', 'Plan', 'Amount', 'Payment Mode'];
    const rows = filteredPayments.map(p => {
      const plan = plans.find(pl => pl.id === p.planId);
      const memberName = `"${p.memberName.replace(/"/g, '""')}"`;
      return [p.id, formatDate(p.date), p.memberId, memberName, plan ? plan.name : 'N/A', p.amount, p.mode].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDownloadOptions(false);
  };

  const handleDownloadPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { filename, title } = getFilenameAndTitle();

    doc.text(`Gym Admin Pro - ${title}`, 14, 16);
    
    const tableColumn = ["Date", "Member ID", "Member Name", "Plan", "Amount", "Payment Mode"];
    const tableRows: any[] = [];

    filteredPayments.forEach(payment => {
      const plan = plans.find(p => p.id === payment.planId);
      const paymentData = [
        formatDate(payment.date),
        payment.memberId,
        payment.memberName,
        plan ? plan.name : 'N/A',
        formatCurrency(payment.amount),
        payment.mode,
      ];
      tableRows.push(paymentData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      theme: 'grid'
    });
    
    doc.save(`${filename}.pdf`);
    setShowDownloadOptions(false);
  };

  return (
    <div className="space-y-4">
      {/* Monthly Revenue Summary & Filter */}
      <div>
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-kanit font-semibold text-zinc-300">Revenue</h3>
                 {availableYears.length > 0 && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    aria-label="Select year for payments overview"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}
            </div>
             <div className="flex items-center gap-4">
                {selectedMonth !== 'all' && (
                    <button onClick={() => setSelectedMonth('all')} className="text-xs text-red-500 hover:underline font-semibold">
                        Show All
                    </button>
                )}
                <button 
                    onClick={() => setShowDownloadOptions(true)} 
                    className="text-zinc-400 hover:text-white transition-colors"
                    aria-label="Download transactions"
                >
                    <DownloadIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`flex-shrink-0 w-24 p-2 rounded-lg text-center transition-colors ${
              selectedMonth === 'all' ? 'bg-red-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            <p className="text-sm font-kanit font-semibold">All Year</p>
            <p className={`text-xs ${selectedMonth === 'all' ? 'text-zinc-200' : 'text-zinc-400'}`}>{formatCurrency(totalRevenueForSelectedYear)}</p>
          </button>
          {monthShortNames.map((name, index) => {
            const isActive = selectedMonth === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedMonth(index)}
                className={`flex-shrink-0 w-24 p-2 rounded-lg text-center transition-colors ${
                  isActive ? 'bg-red-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                <p className="text-sm font-kanit font-semibold">{name}</p>
                <p className={`text-xs ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`}>{formatCurrency(monthlyRevenue[index])}</p>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Payments List */}
      <h3 className="text-lg font-kanit font-semibold text-zinc-300 pt-2">
        {selectedMonth === 'all' ? `All Transactions - ${selectedYear}` : `${monthNames[selectedMonth]} Transactions - ${selectedYear}`}
      </h3>
      {filteredPayments.length > 0 ? (
        <ul className="space-y-3">
          {filteredPayments.map(payment => {
            const plan = plans.find(p => p.id === payment.planId);
            return (
              <li key={payment.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center space-x-3">
                <img src={payment.memberPhotoUrl} alt={payment.memberName} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-zinc-200">{payment.memberName}</p>
                    <p className="text-xs font-mono text-zinc-500">{payment.memberId}</p>
                  </div>
                  <p className="text-xs text-zinc-400">{plan?.name || 'Plan'} - {formatDate(payment.date)}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-white">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-zinc-500">{payment.mode}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-zinc-500 pt-8">No payments found for this period.</p>
      )}

      {/* Download Options Modal */}
      {showDownloadOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-xs border border-zinc-700 text-center">
                <h3 className="text-xl font-kanit font-semibold text-white mb-6">
                  {`Download ${selectedMonth === 'all' ? `All ${selectedYear}` : `${monthNames[selectedMonth]} ${selectedYear}`} Transactions`}
                </h3>
                <div className="space-y-3">
                    <button onClick={handleDownloadCSV} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Download as CSV (Excel)
                    </button>
                    <button onClick={handleDownloadPDF} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Download as PDF
                    </button>
                </div>
                <button onClick={() => setShowDownloadOptions(false)} className="w-full mt-6 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-lg">
                    Cancel
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Payments;