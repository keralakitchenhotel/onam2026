import { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  staff: 'Staff',
  customer: 'Customer',
  driver: 'Delivery',
};

export const ROLE_HOME_PATHS: Record<UserRole, string> = {
  admin: '/admin',
  staff: '/kitchen',
  customer: '/dashboard',
  driver: '/deliver',
};

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

// Seeded in Supabase Auth (see supabase/schema.sql). Passwords are demo-only.
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@keralakitchen.com',
    password: 'admin@7736',
    name: 'Restaurant Admin',
    role: 'admin',
  },
  {
    email: 'staff@keralakitchen.com',
    password: 'staff@7736',
    name: 'Kitchen Staff',
    role: 'staff',
  },
  {
    email: 'driver@keralakitchen.com',
    password: 'driver@7736',
    name: 'Delivery Driver',
    role: 'driver',
  },
  {
    email: 'customer@keralakitchen.com',
    password: 'customer@123',
    name: 'Onam Customer',
    role: 'customer',
  },
];