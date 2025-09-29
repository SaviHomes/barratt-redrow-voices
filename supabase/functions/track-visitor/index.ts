import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationData {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

async function getLocationFromIP(ip: string): Promise<LocationData> {
  try {
    // Using ipapi.co for IP geolocation (free tier available)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) {
      console.log('Failed to fetch location data:', response.status);
      return {};
    }
    
    const data = await response.json();
    
    return {
      country: data.country_name || undefined,
      region: data.region || undefined,
      city: data.city || undefined,
      timezone: data.timezone || undefined,
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return {};
  }
}

function getClientIP(req: Request): string {
  // Try different headers for IP address
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback - this won't be the real IP in production
  return '127.0.0.1';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { page_path, referrer, session_id } = await req.json();
    
    // Get client IP address
    const clientIP = getClientIP(req);
    console.log('Client IP:', clientIP);
    
    // Get user agent
    const userAgent = req.headers.get('user-agent') || '';
    
    // Get location data from IP
    const locationData = await getLocationFromIP(clientIP);
    console.log('Location data:', locationData);
    
    // Insert visitor data into database
    const { error } = await supabase
      .from('visitor_analytics')
      .insert({
        ip_address: clientIP,
        country: locationData.country,
        region: locationData.region,
        city: locationData.city,
        timezone: locationData.timezone,
        user_agent: userAgent,
        referrer: referrer || null,
        page_path: page_path || '/',
        session_id: session_id || null,
      });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track visitor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error tracking visitor:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});