-- Create RPC function to get users with emails from auth.users
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
    u.email,
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

-- Create RPC function to get evidence statistics per user
CREATE OR REPLACE FUNCTION public.get_user_evidence_stats()
RETURNS TABLE (
  user_id uuid,
  evidence_count bigint,
  photo_count bigint,
  video_count bigint,
  total_media_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can view user evidence statistics';
  END IF;
  
  RETURN QUERY
  SELECT 
    e.user_id,
    COUNT(DISTINCT e.id)::bigint as evidence_count,
    COUNT(CASE 
      WHEN epc.photo_path NOT LIKE '%.mp4' 
      AND epc.photo_path NOT LIKE '%.mov' 
      AND epc.photo_path NOT LIKE '%.avi' 
      AND epc.photo_path NOT LIKE '%.webm'
      AND epc.photo_path NOT LIKE '%.mkv'
      AND epc.photo_path NOT LIKE '%.m4v'
      THEN 1 
    END)::bigint as photo_count,
    COUNT(CASE 
      WHEN epc.photo_path LIKE '%.mp4' 
      OR epc.photo_path LIKE '%.mov' 
      OR epc.photo_path LIKE '%.avi' 
      OR epc.photo_path LIKE '%.webm'
      OR epc.photo_path LIKE '%.mkv'
      OR epc.photo_path LIKE '%.m4v'
      THEN 1 
    END)::bigint as video_count,
    COUNT(epc.id)::bigint as total_media_count
  FROM public.evidence e
  LEFT JOIN public.evidence_photo_captions epc ON epc.evidence_id = e.id
  GROUP BY e.user_id;
END;
$$;