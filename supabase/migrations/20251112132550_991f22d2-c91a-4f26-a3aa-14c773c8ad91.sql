-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_users_with_emails();

-- Recreate with explicit type casting for email
CREATE OR REPLACE FUNCTION public.get_users_with_emails()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  street_name text,
  property_number text,
  development_name text,
  town_city text,
  county text,
  postcode text,
  home_tel text,
  mobile_tel text,
  whatsapp_consent boolean,
  nhbc_contact boolean,
  social_media_consent boolean,
  decision_influenced boolean,
  build_style text,
  advice_to_others text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can view all user emails';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    u.email::text,
    p.street_name,
    p.property_number,
    p.development_name,
    p.town_city,
    p.county,
    p.postcode,
    p.home_tel,
    p.mobile_tel,
    p.whatsapp_consent,
    p.nhbc_contact,
    p.social_media_consent,
    p.decision_influenced,
    p.build_style,
    p.advice_to_others,
    p.created_at
  FROM public.profiles p
  INNER JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;