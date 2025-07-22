
-- Add ocr_confidence column to bills table if it doesn't exist
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS ocr_confidence DECIMAL(3,2) DEFAULT 0;
