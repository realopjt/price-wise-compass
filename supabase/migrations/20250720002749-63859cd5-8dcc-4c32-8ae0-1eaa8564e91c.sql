
-- Create the 'bills' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('bills', 'bills', true);

-- Create RLS policies for the bills bucket
CREATE POLICY "Users can upload their own bills" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'bills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own bills" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'bills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own bills" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'bills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own bills" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'bills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
