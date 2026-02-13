-- Force Verify the user 'imalive.nowwhat@gmail.com'
UPDATE auth.users
SET email_confirmed_at = now(),
    confirmed_at = now(),
    last_sign_in_at = now(),
    raw_app_meta_data = raw_app_meta_data || '{"provider": "email", "providers": ["email"]}'::jsonb
WHERE email = 'imalive.nowwhat@gmail.com';
