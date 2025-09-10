import React from 'react';
import ProfileIcon from './icons/ProfileIcon';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, onProfileClick }) => {
  return (
    <header className="bg-zinc-900 p-4 shadow-md shadow-red-900/20 flex items-center justify-between relative">
       <div className="w-1/4">
        {showBack && (
            <button onClick={onBack} className="text-zinc-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
        )}
      </div>

      <div className="w-1/2 text-center">
        <h1 className="text-xl font-bold font-kanit text-red-500 tracking-wider uppercase">{title}</h1>
      </div>

      <div className="w-1/4 flex justify-end">
         <button onClick={onProfileClick} className="text-zinc-300 hover:text-white transition-colors">
            <ProfileIcon className="h-7 w-7" />
        </button>
      </div>
    </header>
  );
};

export default Header;