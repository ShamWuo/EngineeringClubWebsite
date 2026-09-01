-- Migration 00006: Fairview High School Branding Update
UPDATE club_settings 
SET club_name = 'Fairview High School Engineering Club', 
    allowed_email_domain = 'bvsd.org' 
WHERE id = 'default';

INSERT INTO club_settings (id, club_name, allowed_email_domain, budget_ceiling_cents)
VALUES ('default', 'Fairview High School Engineering Club', 'bvsd.org', 5000000)
ON CONFLICT (id) DO UPDATE 
SET club_name = 'Fairview High School Engineering Club',
    allowed_email_domain = 'bvsd.org';
