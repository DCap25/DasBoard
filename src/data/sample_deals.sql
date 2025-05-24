-- Sample F&I Managers
INSERT INTO users (id, name, email, role_id) VALUES
('fi-1', 'John Doe', 'john.doe@dealership.com', 'fi-role'),
('fi-2', 'Jane Smith', 'jane.smith@dealership.com', 'fi-role'),
('fi-3', 'Mike Johnson', 'mike.johnson@dealership.com', 'fi-role');

-- Sample Deals
INSERT INTO deals (
  id,
  stock_number,
  customer_last_name,
  deal_type,
  vsc_profit,
  ppm_profit,
  tire_wheel_profit,
  paint_fabric_profit,
  other_profit,
  front_end_gross,
  status,
  fi_manager_id,
  created_at
) VALUES
-- Funded deals
('deal-1', '12345', 'Smith', 'Finance', 1000.00, 500.00, 300.00, 200.00, 100.00, 5000.00, 'Funded', 'fi-1', '2024-01-01T00:00:00Z'),
('deal-2', '23456', 'Johnson', 'Lease', 800.00, 400.00, 200.00, 100.00, 50.00, 4000.00, 'Funded', 'fi-1', '2024-01-02T00:00:00Z'),
('deal-3', '34567', 'Williams', 'Finance', 1200.00, 600.00, 400.00, 300.00, 200.00, 6000.00, 'Funded', 'fi-2', '2024-01-03T00:00:00Z'),
('deal-4', '45678', 'Brown', 'Lease', 900.00, 450.00, 250.00, 150.00, 75.00, 4500.00, 'Funded', 'fi-2', '2024-01-04T00:00:00Z'),
('deal-5', '56789', 'Davis', 'Finance', 1100.00, 550.00, 350.00, 250.00, 150.00, 5500.00, 'Funded', 'fi-3', '2024-01-05T00:00:00Z'),

-- Pending deals
('deal-6', '67890', 'Miller', 'Lease', 700.00, 350.00, 150.00, 50.00, 25.00, 3500.00, 'Pending', 'fi-1', '2024-01-06T00:00:00Z'),
('deal-7', '78901', 'Wilson', 'Finance', 950.00, 475.00, 275.00, 175.00, 125.00, 4750.00, 'Pending', 'fi-2', '2024-01-07T00:00:00Z'),
('deal-8', '89012', 'Moore', 'Lease', 850.00, 425.00, 225.00, 125.00, 100.00, 4250.00, 'Pending', 'fi-3', '2024-01-08T00:00:00Z'),
('deal-9', '90123', 'Taylor', 'Finance', 1050.00, 525.00, 325.00, 225.00, 175.00, 5250.00, 'Pending', 'fi-1', '2024-01-09T00:00:00Z'),
('deal-10', '01234', 'Anderson', 'Lease', 750.00, 375.00, 175.00, 75.00, 50.00, 3750.00, 'Pending', 'fi-2', '2024-01-10T00:00:00Z'); 