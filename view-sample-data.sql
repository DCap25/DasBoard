-- View Sample Data for Das Board
-- This script shows the data in your tables after populating with sample data

-- View dealership groups
SELECT id, name, description
FROM public.dealership_groups
ORDER BY id;

-- View dealerships with their group names
SELECT d.id, d.name, d.city, d.state, dg.name as group_name
FROM public.dealerships d
JOIN public.dealership_groups dg ON d.group_id = dg.id
ORDER BY d.id;

-- View roles
SELECT id, name
FROM public.roles
ORDER BY name;

-- View profiles/users
SELECT p.id, p.name, p.email, p.role, d.name as dealership_name
FROM public.profiles p
LEFT JOIN public.dealerships d ON p.dealership_id = d.id
ORDER BY p.role, p.name;

-- Count records in each table
SELECT 'dealership_groups' as table_name, COUNT(*) as record_count FROM public.dealership_groups
UNION ALL
SELECT 'dealerships', COUNT(*) FROM public.dealerships
UNION ALL
SELECT 'roles', COUNT(*) FROM public.roles
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles; 