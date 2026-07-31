ALTER TABLE public.evidence ADD COLUMN development_name TEXT;
CREATE INDEX idx_evidence_development_name ON public.evidence(development_name);