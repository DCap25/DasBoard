-- Enable Row Level Security on schedules table
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Everyone can view schedules (read-only for salespeople)
CREATE POLICY schedules_view_policy
  ON schedules
  FOR SELECT
  USING (true);

-- Create RLS policy: Only managers and admins can create/edit schedules
CREATE POLICY schedules_manage_policy
  ON schedules
  FOR INSERT UPDATE DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role IN ('sales_manager', 'general_manager', 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role IN ('sales_manager', 'general_manager', 'admin'))
    )
  );

-- Create or replace a function to update user's team in profile
CREATE OR REPLACE FUNCTION update_salesperson_team()
RETURNS TRIGGER AS $$
BEGIN
  -- When a schedule is created or updated with a team assignment,
  -- update the salesperson's team in their profile
  IF NEW.team IS NOT NULL THEN
    UPDATE profiles
    SET team = NEW.team
    WHERE id = NEW.salesperson_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the salesperson's team when a schedule is created or updated
CREATE TRIGGER update_team_on_schedule_change
  AFTER INSERT OR UPDATE OF team ON schedules
  FOR EACH ROW
  WHEN (NEW.team IS NOT NULL)
  EXECUTE FUNCTION update_salesperson_team();

-- Create a notification function for schedule changes
CREATE OR REPLACE FUNCTION notify_schedule_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a notification for the salesperson
  INSERT INTO notifications (
    user_id,
    message,
    type,
    related_id,
    created_at
  )
  VALUES (
    NEW.salesperson_id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'You have been scheduled for ' || to_char(NEW.date::date, 'FMDay, FMMonth DD')
      WHEN TG_OP = 'UPDATE' THEN 'Your schedule has been updated for ' || to_char(NEW.date::date, 'FMDay, FMMonth DD')
      ELSE 'Schedule notification'
    END,
    'schedule',
    NEW.id,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_notification_type CHECK (type IN ('schedule', 'deal', 'announcement', 'other'))
);

-- Create a trigger to send notifications on schedule changes
CREATE TRIGGER notify_on_schedule_change
  AFTER INSERT OR UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION notify_schedule_change();

-- Create RLS policy for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_user_only
  ON notifications
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comments for documentation
COMMENT ON POLICY schedules_view_policy ON schedules IS 'All authenticated users can view schedules';
COMMENT ON POLICY schedules_manage_policy ON schedules IS 'Only managers and admins can manage schedules';
COMMENT ON FUNCTION update_salesperson_team() IS 'Updates the team assignment in a salesperson profile when scheduled to a team';
COMMENT ON FUNCTION notify_schedule_change() IS 'Creates notifications for salespeople when their schedule changes';
COMMENT ON TABLE notifications IS 'Table for storing user notifications across the application'; 