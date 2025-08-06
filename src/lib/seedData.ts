import supabase from './supabaseClient';
import { mockDealerships, mockUsers, mockSales, mockFniDetails, mockMetrics } from './mockData';

// Initialize the database with mock data
export async function seedDatabase() {
  try {
    // First check if data already exists
    const { count: dealershipCount } = await supabase
      .from('dealerships')
      .select('*', { count: 'exact', head: true });

    if (dealershipCount && dealershipCount > 0) {
      console.log('Database already seeded. Skipping seed operation.');
      return;
    }

    console.log('Seeding database with mock data...');

    // Insert dealerships
    const { error: dealershipsError } = await supabase
      .from('dealerships')
      .insert(mockDealerships);
    
    if (dealershipsError) throw dealershipsError;
    console.log('Dealerships seeded successfully');

    // Insert users (profiles)
    // Note: This assumes users are already created in auth - this just adds profile data
    const { error: usersError } = await supabase
      .from('profiles')
      .insert(mockUsers);
    
    if (usersError) throw usersError;
    console.log('User profiles seeded successfully');

    // Insert sales
    const { error: salesError } = await supabase
      .from('sales')
      .insert(mockSales);
    
    if (salesError) throw salesError;
    console.log('Sales seeded successfully');

    // Insert F&I details
    const { error: fniError } = await supabase
      .from('fni_details')
      .insert(mockFniDetails);
    
    if (fniError) throw fniError;
    console.log('F&I details seeded successfully');

    // Insert metrics
    const { error: metricsError } = await supabase
      .from('metrics')
      .insert(mockMetrics);
    
    if (metricsError) throw metricsError;
    console.log('Metrics seeded successfully');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Function to create test users in Supabase Auth
export async function createTestUsers() {
  try {
    for (const user of mockUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', user.email);
      
      if (existingUsers && existingUsers.length > 0) {
        console.log(`User with email ${user.email} already exists. Skipping...`);
        continue;
      }
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: import.meta.env.VITE_TEST_USER_PASSWORD || 'defaultTestPassword123', // Use environment variable
        options: {
          data: {
            name: user.name,
            role: user.role,
            dealership_id: user.dealership_id
          }
        }
      });
      
      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
        continue;
      }
      
      console.log(`Created user: ${user.email}`);
    }
    
    console.log('Test users created successfully!');
  } catch (error) {
    console.error('Error creating test users:', error);
    throw error;
  }
}

// Function to clear all data from the database (for testing)
export async function clearDatabase() {
  try {
    console.log('Clearing database...');
    
    // Delete in proper order to respect foreign keys
    await supabase.from('fni_details').delete().neq('id', '');
    await supabase.from('metrics').delete().neq('id', '');
    await supabase.from('sales').delete().neq('id', '');
    await supabase.from('profiles').delete().neq('id', '');
    await supabase.from('dealerships').delete().neq('id', '');
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

// Utility function to initialize the database for development
export async function initializeDatabase() {
  // For development, we'll check if data exists, and if not, seed it
  try {
    const { count } = await supabase
      .from('dealerships')
      .select('*', { count: 'exact', head: true });
    
    if (!count || count === 0) {
      await createTestUsers();
      await seedDatabase();
      return true;
    } else {
      console.log('Database already contains data. No initialization needed.');
      return false;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
} 