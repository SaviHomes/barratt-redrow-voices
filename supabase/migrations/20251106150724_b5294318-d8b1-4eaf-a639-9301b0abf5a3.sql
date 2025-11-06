-- Add development_name column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS development_name TEXT;

-- Update the handle_new_user function to include development_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    street_name,
    town_city,
    county,
    postcode,
    development_name,
    whatsapp_consent,
    nhbc_contact,
    social_media_consent,
    decision_influenced
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'street_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'town_city', ''),
    COALESCE(NEW.raw_user_meta_data->>'county', ''),
    COALESCE(NEW.raw_user_meta_data->>'postcode', ''),
    COALESCE(NEW.raw_user_meta_data->>'development_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'whatsapp_consent')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'nhbc_contact')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'social_media_consent')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'decision_influenced')::boolean, null)
  );
  RETURN NEW;
END;
$function$;