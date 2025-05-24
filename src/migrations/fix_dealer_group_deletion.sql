-- Create a function to properly delete a dealer group and reset sequences
CREATE OR REPLACE FUNCTION delete_dealer_group(group_id INT)
RETURNS BOOLEAN AS $$
DECLARE
    success BOOLEAN := FALSE;
BEGIN
    -- First, check if the group exists
    IF NOT EXISTS (SELECT 1 FROM dealer_groups WHERE id = group_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Start a transaction for atomicity
    BEGIN
        -- Remove admin associations first (foreign key)
        DELETE FROM dealer_group_admins WHERE dealer_group_id = group_id;
        
        -- Update dealerships to remove association with this group
        UPDATE dealerships SET dealer_group_id = NULL WHERE dealer_group_id = group_id;
        
        -- Finally delete the group itself
        DELETE FROM dealer_groups WHERE id = group_id;
        
        -- Reset the sequence to the max ID + 1 (or 1 if no groups exist)
        EXECUTE format('SELECT setval(''dealer_groups_id_seq'', COALESCE((SELECT MAX(id) FROM dealer_groups), 0) + 1, false)');
        
        success := TRUE;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error deleting dealer group: %', SQLERRM;
            RETURN FALSE;
    END;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get the correct dealer group count
CREATE OR REPLACE FUNCTION get_dealer_group_count()
RETURNS INT AS $$
DECLARE
    group_count INT;
BEGIN
    SELECT COUNT(*) INTO group_count FROM dealer_groups;
    RETURN group_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the dealer_count after group creation/deletion
CREATE OR REPLACE FUNCTION update_dealer_count_in_group()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the dealer count for the affected group
    IF TG_OP = 'UPDATE' AND OLD.dealer_group_id IS DISTINCT FROM NEW.dealer_group_id THEN
        -- Handle a dealership being moved from one group to another
        IF OLD.dealer_group_id IS NOT NULL THEN
            UPDATE dealer_groups 
            SET dealer_count = (SELECT COUNT(*) FROM dealerships WHERE dealer_group_id = OLD.dealer_group_id)
            WHERE id = OLD.dealer_group_id;
        END IF;
        
        IF NEW.dealer_group_id IS NOT NULL THEN
            UPDATE dealer_groups 
            SET dealer_count = (SELECT COUNT(*) FROM dealerships WHERE dealer_group_id = NEW.dealer_group_id)
            WHERE id = NEW.dealer_group_id;
        END IF;
    ELSIF TG_OP = 'INSERT' AND NEW.dealer_group_id IS NOT NULL THEN
        -- A new dealership was added to a group
        UPDATE dealer_groups 
        SET dealer_count = (SELECT COUNT(*) FROM dealerships WHERE dealer_group_id = NEW.dealer_group_id)
        WHERE id = NEW.dealer_group_id;
    ELSIF TG_OP = 'DELETE' AND OLD.dealer_group_id IS NOT NULL THEN
        -- A dealership was removed from a group
        UPDATE dealer_groups 
        SET dealer_count = (SELECT COUNT(*) FROM dealerships WHERE dealer_group_id = OLD.dealer_group_id)
        WHERE id = OLD.dealer_group_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- First make sure there's a dealer_count column in the dealer_groups table
ALTER TABLE dealer_groups ADD COLUMN IF NOT EXISTS dealer_count INT DEFAULT 0;

-- Create trigger on dealerships table
DROP TRIGGER IF EXISTS dealership_count_trigger ON dealerships;
CREATE TRIGGER dealership_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON dealerships
FOR EACH ROW EXECUTE FUNCTION update_dealer_count_in_group();

-- Initialize dealer_count values for existing groups
UPDATE dealer_groups g
SET dealer_count = (SELECT COUNT(*) FROM dealerships WHERE dealer_group_id = g.id);

-- Ensure all sequences are properly reset to avoid gaps
SELECT setval('dealer_groups_id_seq', COALESCE((SELECT MAX(id) FROM dealer_groups), 0) + 1, false);
SELECT setval('dealer_group_admins_id_seq', COALESCE((SELECT MAX(id) FROM dealer_group_admins), 0) + 1, false); 