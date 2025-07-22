-- Create bill_templates table for template functionality
CREATE TABLE IF NOT EXISTS public.bill_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  average_amount NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bill_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bill templates" 
ON public.bill_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bill templates" 
ON public.bill_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bill templates" 
ON public.bill_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bill templates" 
ON public.bill_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_bill_templates_updated_at
BEFORE UPDATE ON public.bill_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();