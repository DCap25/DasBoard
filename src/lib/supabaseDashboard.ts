import { supabase } from './supabaseClient';

// Get the current user's profile (from users table)
export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: authError || 'No user', data: null };

  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { data, error };
}

// Get leaderboard: all salespeople at the same dealership, ranked by deal count
type LeaderboardEntry = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  deal_count: number;
};
export async function getSalesLeaderboard(dealership_id: number) {
  // Get all salespeople at this dealership
  const { data: users, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email')
    .eq('dealership_id', dealership_id);
  if (error || !users) return { data: [], error };

  // For each salesperson, count their deals
  const leaderboard: LeaderboardEntry[] = [];
  for (const user of users) {
    const { count } = await supabase
      .from('deals')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id);
    leaderboard.push({ ...user, deal_count: count || 0 });
  }
  leaderboard.sort((a, b) => b.deal_count - a.deal_count);
  return { data: leaderboard, error: null };
}

// Get all deals for the current user
export async function getUserDeals(user_id: string) {
  const { data, error } = await supabase.from('deals').select('*').eq('created_by', user_id);
  return { data, error };
}

// Get pay plan for the user's role and dealership
export async function getPayPlan(role_id: string, dealership_id: number) {
  const { data, error } = await supabase
    .from('pay_plans')
    .select('*')
    .eq('role_id', role_id)
    .eq('dealership_id', dealership_id)
    .single();
  return { data, error };
}

// Get schedule for the current user
export async function getUserSchedule(user_id: string) {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', user_id)
    .order('start_time', { ascending: true });
  return { data, error };
}
