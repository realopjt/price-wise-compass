-- Add enhanced OCR fields to bills table
ALTER TABLE public.bills 
ADD COLUMN account_number TEXT,
ADD COLUMN due_date DATE,
ADD COLUMN previous_balance NUMERIC,
ADD COLUMN current_charges NUMERIC,
ADD COLUMN tax_amount NUMERIC,
ADD COLUMN contact_info JSONB,
ADD COLUMN service_details JSONB;