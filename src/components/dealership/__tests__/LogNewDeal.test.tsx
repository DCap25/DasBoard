import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import LogNewDeal from '../LogNewDeal';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock supabase
vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { role_id: 'fi-role-id' }, error: null }),
  },
}));

describe('LogNewDeal Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock the auth context with a logged-in F&I manager
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id', name: 'Test User' },
      role: 'F&I',
      loading: false,
    });
  });

  it('renders the form with all required fields', () => {
    render(
      <BrowserRouter>
        <LogNewDeal />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/stock number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last 8 of vin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/front end gross/i)).toBeInTheDocument();
  });

  it('calculates total F&I profit correctly', async () => {
    render(
      <BrowserRouter>
        <LogNewDeal />
      </BrowserRouter>
    );

    // Fill in profit fields
    fireEvent.change(screen.getByLabelText(/vsc profit/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ppm profit/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/tire & wheel profit/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText(/paint & fabric profit/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/other profit/i), { target: { value: '100' } });

    // Check if total is calculated correctly
    expect(screen.getByText('$2,100.00')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <BrowserRouter>
        <LogNewDeal />
      </BrowserRouter>
    );

    // Try to submit empty form
    fireEvent.click(screen.getByText(/create deal/i));

    // Check for validation errors
    expect(await screen.findByText(/stock number is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/last 8 of vin must be 8 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/customer last name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/front end gross must be a positive number/i)).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    render(
      <BrowserRouter>
        <LogNewDeal />
      </BrowserRouter>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/stock number/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/last 8 of vin/i), { target: { value: 'ABCD1234' } });
    fireEvent.change(screen.getByLabelText(/customer last name/i), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/front end gross/i), { target: { value: '5000' } });

    // Submit form
    fireEvent.click(screen.getByText(/create deal/i));

    // Check if supabase insert was called with correct data
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('deals');
      expect(supabase.from('deals').insert).toHaveBeenCalledWith(
        expect.objectContaining({
          stock_number: '12345',
          vin_last8: 'ABCD1234',
          customer_last_name: 'Smith',
          front_end_gross: 5000,
          status: 'Pending',
          fi_manager_id: 'test-user-id',
        })
      );
    });
  });

  it('handles submission errors', async () => {
    // Mock a submission error
    (supabase.from('deals').insert as jest.Mock).mockResolvedValueOnce({
      error: new Error('Database error'),
    });

    render(
      <BrowserRouter>
        <LogNewDeal />
      </BrowserRouter>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/stock number/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/last 8 of vin/i), { target: { value: 'ABCD1234' } });
    fireEvent.change(screen.getByLabelText(/customer last name/i), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/front end gross/i), { target: { value: '5000' } });

    // Submit form
    fireEvent.click(screen.getByText(/create deal/i));

    // Check if error message is displayed
    expect(await screen.findByText(/failed to create deal/i)).toBeInTheDocument();
  });
}); 