-- Add 6 more Junior CS users to the database
-- Run this in Supabase SQL Editor

INSERT INTO users (name, email, password, role, avatar) VALUES
('Budi Santoso', 'budi.santoso@vastel.id', 'password123', 'junior', NULL),
('Dewi Kartika', 'dewi.kartika@vastel.id', 'password123', 'junior', NULL),
('Rizky Pratama', 'rizky.pratama@vastel.id', 'password123', 'junior', NULL),
('Andi Wijaya', 'andi.wijaya@vastel.id', 'password123', 'junior', NULL),
('Maya Sari', 'maya.sari@vastel.id', 'password123', 'junior', NULL),
('Fajar Rahman', 'fajar.rahman@vastel.id', 'password123', 'junior', NULL);

-- Verify
SELECT name, email, role FROM users WHERE role = 'junior' ORDER BY name;
