-- Seed admin user
-- Password: admin123 (hashed with bcrypt, cost factor 10)
INSERT INTO "User" (id, name, email, username, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'System Admin',
  'admin@example.com',
  'admin',
  '$2b$10$srqh0ZQDID2.8CfwSx55KuvWJ/dn/xqBQtNQzjKuPfnxe8Epgpehi',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;
