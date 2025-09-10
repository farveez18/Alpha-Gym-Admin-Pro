
import React, { useState, useCallback, useMemo } from 'react';
import type { Member, GymProfile, View, AppData, MembershipPlan } from './types';
// FIX: Import 'getDummyMembers' from './constants'
import { INITIAL_MEMBERSHIP_PLANS, INITIAL_GYM_PROFILE, getDummyMembers } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import AddMember from './components/AddMember';
import MemberDetail from './components/MemberDetail';
import Profile from './components/Profile';
import ExpiringMembers from './components/ExpiringMembers';
import Pricing from './components/Pricing';
import Payments from './components/Payments';
import { getDaysUntilExpiry } from './utils/helpers';


const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  
  const initialData = useMemo(() => ({
    members: getDummyMembers(),
    profile: INITIAL_GYM_PROFILE,
    plans: INITIAL_MEMBERSHIP_PLANS,
  }), []);

  const [appData, setAppData] = useLocalStorage<AppData>('gym_app_data', initialData);
  const { members, profile: gymProfile, plans } = appData;

  const membersArray = useMemo(() => Object.values(members), [members]);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [expiringDaysFilter, setExpiringDaysFilter] = useState<number | null>(null);

  const handleAddMember = useCallback((newMember: Member) => {
    setAppData(prev => ({ ...prev, members: { ...prev.members, [newMember.id]: newMember } }));
    setView('members');
  }, [setAppData]);

  const handleUpdateMember = useCallback((updatedMember: Member) => {
    setAppData(prev => ({
      ...prev,
      members: { ...prev.members, [updatedMember.id]: updatedMember }
    }));
    setView('members');
    setSelectedMemberId(null);
  }, [setAppData]);

  const handleSaveProfile = useCallback((newProfile: GymProfile) => {
    setAppData(prev => ({ ...prev, profile: newProfile }));
  }, [setAppData]);

  const handleUpdatePlans = useCallback((updatedPlans: MembershipPlan[]) => {
    setAppData(prev => ({ ...prev, plans: updatedPlans }));
    setView('dashboard');
  }, [setAppData]);

  const handleSelectMember = useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
    setView('memberDetail');
  }, []);

  const handleNavigateToExpiring = (days: number) => {
    setExpiringDaysFilter(days);
    setView('expiringMembers');
  };
  
  const handleBack = () => {
    if (view === 'memberDetail') {
      setView('members');
      setSelectedMemberId(null);
    } else if (view === 'expiringMembers') {
      setView('dashboard');
      setExpiringDaysFilter(null);
    }
  };

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return members[selectedMemberId] || null;
  }, [members, selectedMemberId]);

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard members={membersArray} onExpiryCardClick={handleNavigateToExpiring} />;
      case 'members':
        return <MembersList members={membersArray} onSelectMember={handleSelectMember} />;
      case 'addMember':
        return <AddMember onAddMember={handleAddMember} members={membersArray} plans={plans} gymProfile={gymProfile} />;
      case 'memberDetail':
        if (selectedMember) {
          return <MemberDetail member={selectedMember} onUpdateMember={handleUpdateMember} gymProfile={gymProfile} plans={plans} />;
        }
        setView('members'); 
        return null;
      case 'profile':
        return <Profile profile={gymProfile} onSave={handleSaveProfile} />;
      case 'pricing':
        return <Pricing plans={plans} onSave={handleUpdatePlans} />;
       case 'payments':
        return <Payments members={membersArray} plans={plans} />;
      case 'expiringMembers':
        if (expiringDaysFilter !== null) {
          const filterLogic = (member: Member) => {
              const days = getDaysUntilExpiry(member.membershipExpiry);
              if (expiringDaysFilter === 3) return days >= 0 && days <= 3;
              if (expiringDaysFilter === 7) return days > 3 && days <= 7;
              if (expiringDaysFilter === 10) return days > 7 && days <= 10;
              return false;
          }
          const filteredMembers = membersArray.filter(filterLogic);
          return <ExpiringMembers members={filteredMembers} days={expiringDaysFilter} gymProfile={gymProfile} plans={plans} />;
        }
        setView('dashboard');
        return null;
      default:
        return <Dashboard members={membersArray} onExpiryCardClick={handleNavigateToExpiring} />;
    }
  };
  
  const getHeaderTitle = () => {
      if (view === 'expiringMembers') return `Expiring in ${expiringDaysFilter} Days`;
      if (view === 'pricing') return 'Membership Pricing';
      if (view === 'payments') return 'Payment History';
      return view.charAt(0).toUpperCase() + view.slice(1).replace(/([A-Z])/g, ' $1').trim();
  }
  
  const showBackButton = ['memberDetail', 'expiringMembers'].includes(view);

  return (
    <div className="h-screen w-screen bg-black text-white font-poppins flex flex-col max-w-md mx-auto shadow-2xl shadow-red-900/50">
      <Header title={getHeaderTitle()} showBack={showBackButton} onBack={handleBack} onProfileClick={() => setView('profile')} />
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {renderContent()}
      </main>
      <BottomNav activeView={view} setView={setView} />
    </div>
  );
};

export default App;