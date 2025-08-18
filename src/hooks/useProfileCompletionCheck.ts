import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PROFILE_COMPLETION_KEY = 'profileCompletionDismissed';
const SIGNUP_DATE_KEY = 'singleFinanceSignupDate';
const PROFILE_COMPLETED_KEY = 'profileCompleted';
const DAYS_UNTIL_PROMPT = 7;

export function useProfileCompletionCheck() {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const { user, role } = useAuth();

  useEffect(() => {
    // Only check for single finance managers
    if (!user || role !== 'finance_manager') return;

    // Check if profile is already completed
    const profileCompleted = localStorage.getItem(PROFILE_COMPLETED_KEY);
    if (profileCompleted === 'true') return;

    // Check if user has dismissed the popup for today
    const dismissedDate = localStorage.getItem(PROFILE_COMPLETION_KEY);
    const today = new Date().toDateString();
    if (dismissedDate === today) return;

    // Get signup date
    const signupDateStr = localStorage.getItem(SIGNUP_DATE_KEY);
    if (!signupDateStr) {
      // If no signup date stored, store current date
      localStorage.setItem(SIGNUP_DATE_KEY, new Date().toISOString());
      return;
    }

    // Calculate days since signup
    const signupDate = new Date(signupDateStr);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Show popup if 7 or more days have passed
    if (daysDifference >= DAYS_UNTIL_PROMPT) {
      setShowProfilePopup(true);
    }
  }, [user, role]);

  const handleClosePopup = () => {
    // Store today's date to prevent showing again today
    localStorage.setItem(PROFILE_COMPLETION_KEY, new Date().toDateString());
    setShowProfilePopup(false);
  };

  const handleCompleteProfile = (profileData: any) => {
    // Store profile data (in real app, this would be sent to backend)
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    localStorage.setItem(PROFILE_COMPLETED_KEY, 'true');
    setShowProfilePopup(false);
  };

  return {
    showProfilePopup,
    handleClosePopup,
    handleCompleteProfile,
  };
}
