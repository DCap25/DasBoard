-- Additional fixes for dealer group counts when creating new groups

-- Add after-insert trigger for dealer groups
CREATE OR REPLACE FUNCTION initialize_dealer_group_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure the dealer_count is properly initialized
    UPDATE dealer_groups
    SET dealer_count = 0
    WHERE id = NEW.id AND dealer_count IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on dealer_groups table for new groups
DROP TRIGGER IF EXISTS dealer_group_insert_trigger ON dealer_groups;
CREATE TRIGGER dealer_group_insert_trigger
AFTER INSERT ON dealer_groups
FOR EACH ROW EXECUTE FUNCTION initialize_dealer_group_count();

-- Function to associate manufacturers with a dealer group
CREATE OR REPLACE FUNCTION associate_manufacturers_with_dealer_group(
    p_group_id INT,
    p_manufacturer_ids INT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    manufacturer_id INT;
    dealership_count INT := 0;
BEGIN
    -- For each manufacturer, find associated dealerships and update their dealer_group_id
    FOREACH manufacturer_id IN ARRAY p_manufacturer_ids
    LOOP
        -- Update dealerships that match this manufacturer to be part of this group
        UPDATE dealerships
        SET dealer_group_id = p_group_id
        WHERE manufacturer_id = manufacturer_id
            AND (dealer_group_id IS NULL OR dealer_group_id != p_group_id);
        
        -- Count the dealerships updated
        dealership_count := dealership_count + (
            SELECT COUNT(*) 
            FROM dealerships 
            WHERE manufacturer_id = manufacturer_id 
                AND dealer_group_id = p_group_id
        );
    END LOOP;
    
    -- Directly update the dealer_count field
    UPDATE dealer_groups
    SET dealer_count = dealership_count
    WHERE id = p_group_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error associating manufacturers: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to manually sync dealer counts for all groups
CREATE OR REPLACE FUNCTION sync_all_dealer_group_counts()
RETURNS VOID AS $$
DECLARE
    group_rec RECORD;
BEGIN
    -- Loop through all dealer groups
    FOR group_rec IN SELECT id FROM dealer_groups
    LOOP
        -- Update the count based on actual dealership associations
        UPDATE dealer_groups
        SET dealer_count = (
            SELECT COUNT(*) 
            FROM dealerships 
            WHERE dealer_group_id = group_rec.id
        )
        WHERE id = group_rec.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the sync function to fix any existing groups
SELECT sync_all_dealer_group_counts(); 