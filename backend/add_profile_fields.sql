-- Add new profile fields to users table
-- Run this SQL in your MySQL database

USE pixshare;

-- Add Work & Education fields
ALTER TABLE users ADD COLUMN current_job VARCHAR(255) AFTER linkedin_url;
ALTER TABLE users ADD COLUMN company VARCHAR(255) AFTER current_job;
ALTER TABLE users ADD COLUMN school VARCHAR(255) AFTER company;
ALTER TABLE users ADD COLUMN university VARCHAR(255) AFTER school;

-- Add Additional Personal Info fields
ALTER TABLE users ADD COLUMN hometown VARCHAR(255) AFTER university;
ALTER TABLE users ADD COLUMN relationship_status VARCHAR(50) AFTER hometown;
ALTER TABLE users ADD COLUMN languages VARCHAR(255) AFTER relationship_status;
ALTER TABLE users ADD COLUMN interests VARCHAR(300) AFTER languages;

-- Verify the changes
DESCRIBE users;

-- Show sample data
SELECT id, display_name, current_job, company, school, university, hometown, relationship_status, languages, interests
FROM users
LIMIT 5;
