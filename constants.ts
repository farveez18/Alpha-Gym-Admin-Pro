import type { MembershipPlan, Member, GymProfile } from './types';
import { PaymentMode } from './types';

export const INITIAL_MEMBERSHIP_PLANS: MembershipPlan[] = [
  { id: '1m', name: '1 Month', durationMonths: 1, price: 1000 },
  { id: '3m', name: '3 Months', durationMonths: 3, price: 2500 },
  { id: '6m', name: '6 Months', durationMonths: 6, price: 4500 },
  { id: '12m', name: '1 Year', durationMonths: 12, price: 8000 },
];

export const INITIAL_GYM_PROFILE: GymProfile = {
    gymName: '',
    gymAddress: '',
    email: '',
    whatsappNumber: '',
    bankAccount: '',
    ifscCode: '',
    upiId: '',
};

export const DEFAULT_AVATAR_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5YzlhOWEiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1bGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiAvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgLz48L3N2Zz4=";

export const ENTRY_FEE = 200;


export const getDummyMembers = (): { [id: string]: Member } => {
  return {};
};