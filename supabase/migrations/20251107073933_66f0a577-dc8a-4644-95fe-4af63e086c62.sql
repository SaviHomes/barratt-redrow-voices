-- ========================================
-- FIX: Add explicit deny policies for anonymous users
-- ========================================

-- 1. Claims Table: Deny all anonymous access
-- This RESTRICTIVE policy ensures auth.uid() is NOT NULL
CREATE POLICY "Deny all anonymous access to claims"
ON public.claims
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 2. Visitor Analytics Table: Deny all anonymous access except service role inserts
-- We need to allow service role to INSERT (for the track-visitor function)
-- but deny all anonymous SELECT/UPDATE/DELETE
CREATE POLICY "Deny anonymous SELECT on visitor analytics"
ON public.visitor_analytics
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny anonymous UPDATE on visitor analytics"
ON public.visitor_analytics
AS RESTRICTIVE
FOR UPDATE
TO public
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny anonymous DELETE on visitor analytics"
ON public.visitor_analytics
AS RESTRICTIVE
FOR DELETE
TO public
USING (auth.uid() IS NOT NULL);