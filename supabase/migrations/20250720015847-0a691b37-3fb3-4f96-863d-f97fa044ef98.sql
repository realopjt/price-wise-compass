-- Create a webhook secret for password reset emails
-- This will be used to verify webhook calls from Supabase Auth
INSERT INTO vault.secrets (name, secret) 
VALUES ('SEND_PASSWORD_RESET_HOOK_SECRET', gen_random_uuid()::text)
ON CONFLICT (name) DO UPDATE SET 
secret = gen_random_uuid()::text;