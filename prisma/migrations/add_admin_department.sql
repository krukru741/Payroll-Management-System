-- Add ADMIN to Department enum
ALTER TYPE "Department" ADD VALUE IF NOT EXISTS 'ADMIN';
