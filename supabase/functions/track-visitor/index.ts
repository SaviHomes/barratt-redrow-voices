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

interface TrafficAnalysis {
  type: 'human' | 'bot' | 'monitoring' | 'unknown';
  isLovableInfra: boolean;
  detectionMethod: string;
  confidence: number;
}

interface RequestTiming {
  processingTime: number;
  sessionDuration?: number;
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

function getAllRequestHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

function analyzeTraffic(req: Request, clientIP: string, userAgent: string, referrer?: string): TrafficAnalysis {
  const headers = getAllRequestHeaders(req);
  let detectionMethods: string[] = [];
  let confidence = 0;
  let type: 'human' | 'bot' | 'monitoring' | 'unknown' = 'unknown';
  let isLovableInfra = false;

  // Check for Lovable infrastructure
  if (
    referrer?.includes('lovable.dev') ||
    referrer?.includes('lovableproject.com') ||
    headers['origin']?.includes('lovable.dev') ||
    headers['host']?.includes('lovableproject.com') ||
    clientIP === '143.58.164.45' // Known Lovable IP
  ) {
    isLovableInfra = true;
    type = 'monitoring';
    detectionMethods.push('lovable_referrer_or_ip');
    confidence += 90;
  }

  // Bot detection patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
    /whatsapp/i, /telegram/i, /discord/i,
    /lighthouse/i, /pagespeed/i, /gtmetrix/i,
    /pingdom/i, /uptimerobot/i, /statuscake/i,
    /headlesschrome/i, /phantomjs/i, /selenium/i
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    if (type === 'unknown') type = 'bot';
    detectionMethods.push('user_agent_pattern');
    confidence += 80;
  }

  // Check for headless browsers
  if (
    userAgent.includes('HeadlessChrome') ||
    userAgent.includes('PhantomJS') ||
    userAgent.includes('SlimerJS') ||
    userAgent === '' ||
    !userAgent.includes('Mozilla')
  ) {
    if (type === 'unknown') type = 'bot';
    detectionMethods.push('headless_browser');
    confidence += 70;
  }

  // Human-like indicators
  const humanIndicators = [
    headers['accept-language'], // Browsers send this
    headers['accept-encoding'], // Browsers send this
    headers['dnt'], // Do Not Track header
    headers['upgrade-insecure-requests'], // Modern browsers
    headers['sec-fetch-site'], // Modern security headers
    headers['sec-fetch-mode'],
    headers['sec-fetch-dest']
  ].filter(Boolean);

  if (humanIndicators.length >= 3 && type === 'unknown') {
    type = 'human';
    detectionMethods.push('browser_headers');
    confidence += 60;
  }

  // Monitoring tool detection
  const monitoringPatterns = [
    /monitoring/i, /uptime/i, /ping/i, /check/i,
    /health/i, /status/i, /probe/i
  ];

  if (monitoringPatterns.some(pattern => pattern.test(userAgent)) && type === 'unknown') {
    type = 'monitoring';
    detectionMethods.push('monitoring_pattern');
    confidence += 85;
  }

  // If no clear detection, default based on basic indicators
  if (type === 'unknown') {
    if (userAgent && userAgent.length > 20 && humanIndicators.length > 0) {
      type = 'human';
      detectionMethods.push('fallback_human_indicators');
      confidence += 30;
    } else {
      type = 'bot';
      detectionMethods.push('fallback_bot_indicators');
      confidence += 20;
    }
  }

  return {
    type,
    isLovableInfra,
    detectionMethod: detectionMethods.join(', '),
    confidence: Math.min(confidence, 100)
  };
}

async function getSessionTiming(supabase: any, clientIP: string, sessionId?: string): Promise<RequestTiming> {
  const startTime = Date.now();
  
  try {
    // Get the last visit from this IP or session
    const { data: lastVisit } = await supabase
      .from('visitor_analytics')
      .select('visited_at')
      .or(`ip_address.eq.${clientIP}${sessionId ? `,session_id.eq.${sessionId}` : ''}`)
      .order('visited_at', { ascending: false })
      .limit(1)
      .single();

    const processingTime = Date.now() - startTime;
    
    if (lastVisit) {
      const lastVisitTime = new Date(lastVisit.visited_at).getTime();
      const sessionDuration = Date.now() - lastVisitTime;
      return { processingTime, sessionDuration };
    }
    
    return { processingTime };
  } catch (error) {
    console.log('Session timing analysis failed:', error);
    return { processingTime: Date.now() - startTime };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestStartTime = Date.now();
    const requestId = crypto.randomUUID();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { page_path, referrer, session_id } = await req.json();
    
    // Get client IP address and full headers
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const requestHeaders = getAllRequestHeaders(req);
    
    // Enhanced logging with request ID
    console.log(`[${requestId}] Processing request from IP: ${clientIP}`);
    console.log(`[${requestId}] User Agent: ${userAgent}`);
    console.log(`[${requestId}] Referrer: ${referrer || 'none'}`);
    console.log(`[${requestId}] Headers:`, JSON.stringify(requestHeaders, null, 2));
    
    // Analyze traffic type and detect Lovable infrastructure
    const trafficAnalysis = analyzeTraffic(req, clientIP, userAgent, referrer);
    console.log(`[${requestId}] Traffic Analysis:`, {
      type: trafficAnalysis.type,
      isLovableInfra: trafficAnalysis.isLovableInfra,
      method: trafficAnalysis.detectionMethod,
      confidence: trafficAnalysis.confidence
    });
    
    // Get session timing
    const timing = await getSessionTiming(supabase, clientIP, session_id);
    console.log(`[${requestId}] Timing:`, timing);
    
    // Get location data from IP (with rate limiting awareness)
    const locationData = await getLocationFromIP(clientIP);
    if (Object.keys(locationData).length === 0) {
      console.log(`[${requestId}] Location lookup failed (likely rate limited)`);
    } else {
      console.log(`[${requestId}] Location data:`, locationData);
    }
    
    // Calculate final processing time
    const finalProcessingTime = Date.now() - requestStartTime;
    
    // Insert comprehensive visitor data into database
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
        // New enhanced fields
        traffic_type: trafficAnalysis.type,
        request_headers: requestHeaders,
        is_lovable_infrastructure: trafficAnalysis.isLovableInfra,
        detection_method: trafficAnalysis.detectionMethod,
        request_timing_ms: finalProcessingTime,
        session_duration_ms: timing.sessionDuration
      });

    if (error) {
      console.error(`[${requestId}] Database error:`, error);
      return new Response(
        JSON.stringify({ error: 'Failed to track visitor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${requestId}] Successfully tracked visitor - Type: ${trafficAnalysis.type}, Lovable: ${trafficAnalysis.isLovableInfra}, Time: ${finalProcessingTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true,
        debug: {
          requestId,
          trafficType: trafficAnalysis.type,
          isLovableInfra: trafficAnalysis.isLovableInfra,
          processingTime: finalProcessingTime
        }
      }),
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