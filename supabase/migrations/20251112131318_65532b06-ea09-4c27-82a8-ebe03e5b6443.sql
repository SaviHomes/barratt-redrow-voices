-- Create RPC function for admin user deletion
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_profile jsonb;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Check if trying to delete self
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  
  -- Get profile data before deletion for return value
  SELECT jsonb_build_object(
    'user_id', user_id,
    'first_name', first_name,
    'last_name', last_name,
    'deleted_at', now()
  ) INTO deleted_profile
  FROM public.profiles
  WHERE user_id = target_user_id;
  
  -- Delete from auth.users (cascades to profiles and other tables)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN deleted_profile;
END;
$$;