-- Create pricing data table for storing retailer prices
CREATE TABLE IF NOT EXISTS public.pricing_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  location TEXT,
  country TEXT,
  availability TEXT,
  rating NUMERIC,
  product_url TEXT,
  image_url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_data ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (pricing data is public)
CREATE POLICY "Public can view pricing data" 
ON public.pricing_data 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX idx_pricing_data_product_retailer ON public.pricing_data(product_name, retailer_name);
CREATE INDEX idx_pricing_data_location ON public.pricing_data(location, country);
CREATE INDEX idx_pricing_data_price ON public.pricing_data(price);

-- Create user preferences table for location settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country TEXT,
  location TEXT,
  global_search_enabled BOOLEAN DEFAULT true,
  preferred_retailers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();