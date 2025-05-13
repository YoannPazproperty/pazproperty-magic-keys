
-- Update user_role enum to include referral_partner
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'referral_partner';

-- Log the change
INSERT INTO public.logs (message, data)
VALUES (
  'Updated user_role enum to include referral_partner',
  jsonb_build_object(
    'updated_at', now(),
    'description', 'Added referral_partner to user_role enum type'
  )
);
