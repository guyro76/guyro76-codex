-- Create admin user
INSERT INTO "users" (id, email, name, password, role, "onboardingComplete", "createdAt", "updatedAt")
VALUES (
  'clr1a2b3c4d5e6f7g8h9i0j1k2',
  'guyro76@gmail.com',
  'גיא רוזנברג',
  '$2a$10$7T6KXPBd3kK3.KL0Z3k2WuQwJ3K3v3K3v3K3v3K3v3K3v3K3v3K3v3',
  'admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT(email) DO UPDATE SET
  role = 'admin',
  "onboardingComplete" = true;
