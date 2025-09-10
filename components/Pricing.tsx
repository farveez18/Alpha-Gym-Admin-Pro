import React, { useState, useEffect } from 'react';
import type { MembershipPlan } from '../types';
import { formatCurrency } from '../utils/helpers';

interface PricingProps {
  plans: MembershipPlan[];
  onSave: (plans: MembershipPlan[]) => void;
}

const Pricing: React.FC<PricingProps> = ({ plans, onSave }) => {
  const [editablePlans, setEditablePlans] = useState<MembershipPlan[]>(plans);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setEditablePlans(plans);
  }, [plans]);

  const handlePriceChange = (planId: string, newPrice: string) => {
    const priceValue = parseInt(newPrice, 10);
    setEditablePlans(currentPlans =>
      currentPlans.map(plan =>
        plan.id === planId ? { ...plan, price: isNaN(priceValue) ? 0 : priceValue } : plan
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editablePlans);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-kanit font-semibold text-white">Edit Plan Prices</h2>
      </div>

      <div className="space-y-4">
        {editablePlans.map(plan => (
          <div key={plan.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex items-center justify-between gap-4">
            <div className='flex-1'>
              <p className="font-kanit font-semibold text-white">{plan.name}</p>
              <p className="text-sm text-zinc-400">{plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''}</p>
            </div>
            <div className="relative w-32">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">₹</span>
              <input
                type="number"
                value={plan.price}
                onChange={(e) => handlePriceChange(plan.id, e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-6 pr-3 text-white text-right font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
              />
            </div>
          </div>
        ))}
      </div>
      
      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg font-kanit">
        {isSaved ? 'Prices Saved!' : 'Save Prices'}
      </button>
    </form>
  );
};

export default Pricing;