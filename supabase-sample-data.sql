-- Sample Data for Das Board Application

-- Insert Dealership
INSERT INTO public.dealerships (name, location)
VALUES ('Auto Haven', 'New York, NY');

-- Note: For the profiles, you'll need to first create users in Supabase Auth
-- and then insert their UUIDs here. These are placeholders that should be replaced
-- with actual UUIDs from created users.

-- Placeholder profiles (replace UUIDs with actual values)
-- After creating users in Supabase Auth UI, replace these sample UUIDs with actual values
-- testsales@example.com - salesperson
-- testfinance@example.com - finance_manager
-- testmanager@example.com - sales_manager
-- testgm@example.com - general_manager
-- testadmin@example.com - admin

INSERT INTO public.profiles (id, email, name, role, dealership_id)
VALUES 
('00000000-0000-0000-0000-000000000001', 'testsales@example.com', 'Test Sales', 'salesperson', 1),
('00000000-0000-0000-0000-000000000002', 'testfinance@example.com', 'Test Finance', 'finance_manager', 1),
('00000000-0000-0000-0000-000000000003', 'testmanager@example.com', 'Test Manager', 'sales_manager', 1),
('00000000-0000-0000-0000-000000000004', 'testgm@example.com', 'Test GM', 'general_manager', 1),
('00000000-0000-0000-0000-000000000005', 'testadmin@example.com', 'Test Admin', 'admin', 1);

-- Sample Sales Data
INSERT INTO public.sales (dealership_id, salesperson_id, customer_name, vehicle_type, vehicle_vin, sale_date, sale_amount, status)
VALUES
(1, '00000000-0000-0000-0000-000000000001', 'John Doe', '2023 Toyota Camry', 'ABC123XYZ456789', '2025-04-15', 28500, 'completed'),
(1, '00000000-0000-0000-0000-000000000001', 'Jane Smith', '2024 Honda Accord', 'DEF456UVW789012', '2025-04-16', 32000, 'completed'),
(1, '00000000-0000-0000-0000-000000000003', 'Robert Johnson', '2023 Ford F-150', 'GHI789RST123456', '2025-04-17', 45000, 'pending'),
(1, '00000000-0000-0000-0000-000000000001', 'Sarah Williams', '2023 Nissan Altima', 'JKL012MNO345678', '2025-04-18', 26000, 'completed');

-- Sample Metrics Data
INSERT INTO public.metrics (dealership_id, sales_count, total_revenue, average_sale_amount, period, date)
VALUES
(1, 3, 86500, 28833.33, 'daily', '2025-04-15'),
(1, 4, 131500, 32875, 'weekly', '2025-04-15'),
(1, 12, 375000, 31250, 'monthly', '2025-04-01');

-- Sample F&I Details
INSERT INTO public.fni_details (sale_id, dealership_id, finance_manager_id, product_type, amount, commission_amount)
VALUES
(1, 1, '00000000-0000-0000-0000-000000000002', 'warranty', 2500, 500),
(1, 1, '00000000-0000-0000-0000-000000000002', 'insurance', 1200, 300),
(2, 1, '00000000-0000-0000-0000-000000000002', 'warranty', 3000, 600),
(2, 1, '00000000-0000-0000-0000-000000000002', 'protection_plan', 800, 200),
(3, 1, '00000000-0000-0000-0000-000000000002', 'service_contract', 2000, 400); 