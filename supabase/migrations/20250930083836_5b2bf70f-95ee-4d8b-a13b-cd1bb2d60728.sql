-- Create a table for financial claims related to property defects
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Property Information
  property_address TEXT NOT NULL,
  development_name TEXT,
  purchase_date DATE,
  completion_date DATE,
  property_type TEXT,
  
  -- Claim Information
  claim_title TEXT NOT NULL,
  claim_description TEXT NOT NULL,
  issues_discovered_date DATE,
  defects_categories TEXT[] DEFAULT '{}',
  
  -- Financial Information
  estimated_damages DECIMAL(10,2),
  costs_incurred DECIMAL(10,2),
  receipts_available BOOLEAN DEFAULT false,
  repair_quotes_obtained BOOLEAN DEFAULT false,
  
  -- Additional Information
  previous_contact_with_redrow BOOLEAN DEFAULT false,
  legal_representation BOOLEAN DEFAULT false,
  additional_notes TEXT,
  
  -- Supporting Documentation
  supporting_documents TEXT[], -- Array of file paths/URLs
  
  -- Status and Timestamps
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own claims" 
ON public.claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims" 
ON public.claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims" 
ON public.claims 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_claims_updated_at
BEFORE UPDATE ON public.claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_claims_user_id ON public.claims(user_id);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_created_at ON public.claims(created_at);

-- Allow admins to view all claims
CREATE POLICY "Admins can view all claims" 
ON public.claims 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all claims" 
ON public.claims 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));