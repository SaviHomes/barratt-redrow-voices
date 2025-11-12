-- Fix handle_new_user() function to capture ALL registration fields
-- Drop the trigger first, then the function, then recreate both

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function with ALL fields from Register.tsx
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
    property_number,
    street_name,
    town_city,
    county,
    postcode,
    development_name,
    home_tel,
    mobile_tel,
    whatsapp_consent,
    build_style,
    advice_to_others,
    nhbc_contact,
    social_media_consent,
    decision_influenced
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'property_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'street_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'town_city', ''),
    COALESCE(NEW.raw_user_meta_data->>'county', ''),
    COALESCE(NEW.raw_user_meta_data->>'postcode', ''),
    COALESCE(NEW.raw_user_meta_data->>'development_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'home_tel', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_tel', ''),
    COALESCE((NEW.raw_user_meta_data->>'whatsapp_consent')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'build_style', ''),
    COALESCE(NEW.raw_user_meta_data->>'advice_to_others', ''),
    COALESCE((NEW.raw_user_meta_data->>'nhbc_contact')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'social_media_consent')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'decision_influenced')::boolean, null)
  );
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();