export enum PaymentMode {
  CASH = 'Cash',
  UPI = 'UPI',
}

export interface Payment {
  id: string;
  date: string; // ISO string
  amount: number;
  planId: string;
  mode: PaymentMode;
  receiptSent?: boolean;
}

export interface Member {
  id:string;
  memberId: string;
  name: string;
  phone: string;
  email?: string;
  joinDate: string; // ISO string
  membershipExpiry: string; // ISO string
  payments: Payment[];
  photoUrl: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
}

export interface GymProfile {
    gymName: string;
    gymAddress: string;
    email: string;
    whatsappNumber: string;
    bankAccount: string;
    ifscCode: string;
    upiId: string;
}

export interface AppData {
  members: { [id: string]: Member };
  profile: GymProfile;
  plans: MembershipPlan[];
}

export type View = 'dashboard' | 'members' | 'addMember' | 'memberDetail' | 'profile' | 'expiringMembers' | 'pricing' | 'payments';