import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import FiDashboard from '../FiDashboard';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock supabase
vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
}));

describe('FiDashboard Component', () => {
  const mockDeals = [
    {
      id: '1',
      stock_number: '12345',
      customer_last_name: 'Smith',
      deal_type: 'Finance',
      vsc_profit: 1000,
      ppm_profit: 500,
      tire_wheel_profit: 300,
      paint_fabric_profit: 200,
      other_profit: 100,
      front_end_gross: 5000,
      status: 'Funded',
      fi_manager_id: 'fi-1',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      stock_number: '67890',
      customer_last_name: 'Johnson',
      deal_type: 'Lease',
      vsc_profit: 800,
      ppm_profit: 400,
      tire_wheel_profit: 200,
      paint_fabric_profit: 100,
      other_profit: 50,
      front_end_gross: 4000,
      status: 'Pending',
      fi_manager_id: 'fi-2',
      created_at: '2024-01-02T00:00:00Z',
    },
  ];

  const mockUsers = [
    { id: 'fi-1', name: 'John Doe', role_id: 'fi-role' },
    { id: 'fi-2', name: 'Jane Smith', role_id: 'fi-role' },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock the auth context with a logged-in F&I manager
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id', name: 'Test User' },
      role: 'F&I',
      loading: false,
    });

    // Mock supabase responses
    (supabase.from('deals').select as jest.Mock).mockResolvedValue({
      data: mockDeals,
      error: null,
    });

    (supabase.from('profiles').select as jest.Mock).mockResolvedValue({
      data: mockUsers,
      error: null,
    });
  });

  it('renders the dashboard with loading state', () => {
    render(
      <BrowserRouter>
        <FiDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays F&I manager statistics correctly', async () => {
    render(
      <BrowserRouter>
        <FiDashboard />
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Check if statistics are calculated correctly
    expect(screen.getByText('$2,100.00')).toBeInTheDocument(); // Total F&I Profit for John Doe
    expect(screen.getByText('$1,550.00')).toBeInTheDocument(); // Total F&I Profit for Jane Smith
  });

  it('handles sorting by different columns', async () => {
    render(
      <BrowserRouter>
        <FiDashboard />
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Test sorting by name
    fireEvent.click(screen.getByText('F&I Manager'));
    expect(supabase.from('deals').order).toHaveBeenCalledWith('fi_manager_id', { ascending: true });

    // Test sorting by total F&I profit
    fireEvent.click(screen.getByText('Total F&I Profit'));
    expect(supabase.from('deals').order).toHaveBeenCalledWith('total_fi_profit', {
      ascending: true,
    });
  });

  it('handles data fetching errors', async () => {
    // Mock an error response
    (supabase.from('deals').select as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: new Error('Database error'),
    });

    render(
      <BrowserRouter>
        <FiDashboard />
      </BrowserRouter>
    );

    // Check if error message is displayed
    expect(await screen.findByText(/error loading data/i)).toBeInTheDocument();
  });

  it('updates data in real-time', async () => {
    const mockSubscription = {
      data: { subscription: { unsubscribe: vi.fn() } },
    };

    (supabase.from('deals').subscribe as jest.Mock).mockReturnValue(mockSubscription);

    render(
      <BrowserRouter>
        <FiDashboard />
      </BrowserRouter>
    );

    // Check if subscription was set up
    expect(supabase.from('deals').subscribe).toHaveBeenCalledWith('*', expect.any(Function));
  });
});
