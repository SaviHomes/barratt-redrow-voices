import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a session ID for tracking user sessions
const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get or create session ID from sessionStorage
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
};

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const sessionId = getSessionId();
        const currentPath = window.location.pathname;
        const referrer = document.referrer;

        // Call the edge function to track the visitor
        const { error } = await supabase.functions.invoke('track-visitor', {
          body: {
            page_path: currentPath,
            referrer: referrer,
            session_id: sessionId,
          },
        });

        if (error) {
          console.error('Failed to track visitor:', error);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    // Track visitor on component mount
    trackVisitor();

    // Track page changes for SPAs
    const handleLocationChange = () => {
      trackVisitor();
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
};