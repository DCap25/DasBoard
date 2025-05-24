-- Insert initial roles
INSERT INTO roles (name) VALUES
    ('Sales'),
    ('F&I'),
    ('Finance Director'),
    ('Sales Manager'),
    ('GSM'),
    ('GM'),
    ('Admin');

-- Insert a sample dealership
INSERT INTO dealerships (name, store_hours, num_teams) VALUES
    ('Sample Dealership',
    '{
        "monday": {"open": "09:00", "close": "21:00"},
        "tuesday": {"open": "09:00", "close": "21:00"},
        "wednesday": {"open": "09:00", "close": "21:00"},
        "thursday": {"open": "09:00", "close": "21:00"},
        "friday": {"open": "09:00", "close": "21:00"},
        "saturday": {"open": "09:00", "close": "18:00"},
        "sunday": {"open": "10:00", "close": "17:00"}
    }'::jsonb,
    3);

-- Insert sample pay plans
INSERT INTO pay_plans (role_id, dealership_id, front_end_percent, back_end_percent, csi_bonus, demo_allowance, vsc_bonus, ppm_bonus, volume_bonus)
SELECT 
    r.id,
    d.id,
    CASE r.name
        WHEN 'Sales' THEN 25.00
        WHEN 'Sales Manager' THEN 5.00
        WHEN 'F&I' THEN 0.00
        WHEN 'Finance Director' THEN 0.00
        ELSE 0.00
    END,
    CASE r.name
        WHEN 'Sales' THEN 0.00
        WHEN 'Sales Manager' THEN 0.00
        WHEN 'F&I' THEN 30.00
        WHEN 'Finance Director' THEN 20.00
        ELSE 0.00
    END,
    CASE r.name
        WHEN 'Sales' THEN 100.00
        WHEN 'Sales Manager' THEN 200.00
        ELSE 0.00
    END,
    CASE r.name
        WHEN 'Sales' THEN 500.00
        WHEN 'Sales Manager' THEN 1000.00
        ELSE 0.00
    END,
    CASE r.name
        WHEN 'F&I' THEN 50.00
        WHEN 'Finance Director' THEN 25.00
        ELSE 0.00
    END,
    CASE r.name
        WHEN 'F&I' THEN 50.00
        WHEN 'Finance Director' THEN 25.00
        ELSE 0.00
    END,
    '{
        "tiers": [
            {"min": 10, "max": 15, "bonus": 500},
            {"min": 16, "max": 20, "bonus": 1000},
            {"min": 21, "max": null, "bonus": 2000}
        ]
    }'::jsonb
FROM roles r
CROSS JOIN dealerships d
WHERE r.name IN ('Sales', 'Sales Manager', 'F&I', 'Finance Director'); 