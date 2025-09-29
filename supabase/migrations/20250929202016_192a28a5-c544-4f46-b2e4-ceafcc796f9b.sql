-- Add enhanced tracking columns to visitor_analytics table
ALTER TABLE public.visitor_analytics 
ADD COLUMN traffic_type TEXT DEFAULT 'unknown',
ADD COLUMN request_headers JSONB,
ADD COLUMN is_lovable_infrastructure BOOLEAN DEFAULT false,
ADD COLUMN detection_method TEXT,
ADD COLUMN request_timing_ms INTEGER,
ADD COLUMN session_duration_ms INTEGER;

-- Add index for better query performance on traffic analysis
CREATE INDEX idx_visitor_analytics_traffic_type ON public.visitor_analytics(traffic_type);
CREATE INDEX idx_visitor_analytics_lovable_infra ON public.visitor_analytics(is_lovable_infrastructure);
CREATE INDEX idx_visitor_analytics_ip_visited ON public.visitor_analytics(ip_address, visited_at);

-- Add comments for documentation
COMMENT ON COLUMN public.visitor_analytics.traffic_type IS 'Classification: human, bot, monitoring, unknown';
COMMENT ON COLUMN public.visitor_analytics.request_headers IS 'Full request headers for analysis';
COMMENT ON COLUMN public.visitor_analytics.is_lovable_infrastructure IS 'Flag indicating Lovable system traffic';
COMMENT ON COLUMN public.visitor_analytics.detection_method IS 'How traffic type was determined';
COMMENT ON COLUMN public.visitor_analytics.request_timing_ms IS 'Request processing time';
COMMENT ON COLUMN public.visitor_analytics.session_duration_ms IS 'Time since last request from same session';