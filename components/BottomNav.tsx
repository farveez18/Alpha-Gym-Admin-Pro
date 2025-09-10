import React from 'react';
import type { View } from '../types';
import HomeIcon from './icons/HomeIcon';
import UsersIcon from './icons/UsersIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import PriceTagIcon from './icons/PriceTagIcon';
import WalletIcon from './icons/WalletIcon';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  view: View;
  activeView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}> = ({ label, view, activeView, setView, children }) => {
  const isActive = activeView === view;
  const colorClass = isActive ? 'text-red-500' : 'text-zinc-400';

  return (
    <button
      onClick={() => setView(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${colorClass} hover:text-red-400`}
    >
      {children}
      <span className={`text-xs font-medium font-kanit ${isActive ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-zinc-900 flex justify-around border-t border-zinc-800 shadow-lg max-w-md mx-auto">
      <NavButton label="Dashboard" view="dashboard" activeView={activeView} setView={setView}>
        <HomeIcon className="w-6 h-6 mb-1" />
      </NavButton>
      <NavButton label="Members" view="members" activeView={activeView} setView={setView}>
        <UsersIcon className="w-6 h-6 mb-1" />
      </NavButton>
      <NavButton label="Payments" view="payments" activeView={activeView} setView={setView}>
        <WalletIcon className="w-6 h-6 mb-1" />
      </NavButton>
      <NavButton label="Add Member" view="addMember" activeView={activeView} setView={setView}>
        <UserPlusIcon className="w-6 h-6 mb-1" />
      </NavButton>
      <NavButton label="Pricing" view="pricing" activeView={activeView} setView={setView}>
        <PriceTagIcon className="w-6 h-6 mb-1" />
      </NavButton>
    </nav>
  );
};

export default BottomNav;