-- Copy and paste this entirely into your Supabase SQL Editor and click RUN

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS logo_image TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo TEXT;

-- This command forces the Supabase API to recognize the new columns immediately
NOTIFY pgrst, 'reload schema';
