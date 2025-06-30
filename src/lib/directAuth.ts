// SECURITY NOTICE: All test authentication functionality has been removed
// for production security. This file is now disabled.

export interface DirectAuthUser {
  id: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  isGroupAdmin?: boolean;
  dealershipId?: number;
  name?: string;
}

// Test accounts are disabled for production security
export const TEST_USERS: DirectAuthUser[] = [];

const STORAGE_KEY = 'das-board-direct-auth-user';

// Get current direct auth user (disabled for production)
export function getCurrentDirectAuthUser(): DirectAuthUser | null {
  return null;
}

// Check if user is authenticated (disabled for production)
export function isDirectAuthAuthenticated(): boolean {
  return false;
}

// Login with a test account (disabled for production)
export function loginWithTestAccount(email: string): { success: boolean; message: string } {
  return {
    success: false,
    message: 'Test authentication is disabled in production',
  };
}

// Logout direct auth user (disabled for production)
export function logoutDirectAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Get redirect path based on user role (disabled for production)
export function getRedirectPath(user: DirectAuthUser): string {
  return '/dashboard';
}

// Check if email is a test email (disabled for production)
export function isTestEmail(email: string): boolean {
  return false;
}
