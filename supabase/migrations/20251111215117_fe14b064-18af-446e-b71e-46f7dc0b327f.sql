-- First, drop the old check constraint
ALTER TABLE evidence DROP CONSTRAINT IF EXISTS evidence_severity_check;

-- Migrate existing data before adding new constraint
UPDATE evidence 
SET severity = CASE 
  WHEN severity = 'low' THEN 'minor'
  WHEN severity = 'medium' THEN 'moderate'
  WHEN severity = 'high' THEN 'severe'
  ELSE severity
END;

-- Now add the new check constraint with updated values
ALTER TABLE evidence ADD CONSTRAINT evidence_severity_check 
  CHECK (severity IN ('minor', 'moderate', 'severe', 'critical'));