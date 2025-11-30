-- Initialize databases for POC stack
-- This script runs automatically when PostgreSQL container starts

-- Create database for Activepieces (Lead Management)
CREATE DATABASE activepieces;

-- Create database for Windmill (Content Creation)
CREATE DATABASE windmill;

-- Create database for n8n (Financial Operations)
CREATE DATABASE n8n;

-- Create database for Metabase
CREATE DATABASE metabase;

-- Grant all privileges to the automation user
GRANT ALL PRIVILEGES ON DATABASE activepieces TO automation;
GRANT ALL PRIVILEGES ON DATABASE windmill TO automation;
GRANT ALL PRIVILEGES ON DATABASE n8n TO automation;
GRANT ALL PRIVILEGES ON DATABASE metabase TO automation;
