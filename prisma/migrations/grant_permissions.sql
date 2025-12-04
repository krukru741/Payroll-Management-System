-- Grant Permissions for Filing System Tables
-- Run this script to fix the "permission denied" errors

-- Replace 'your_database_user' with your actual PostgreSQL username
-- If you're not sure, it's likely the same user in your DATABASE_URL

-- Grant all permissions on the new tables
GRANT ALL PRIVILEGES ON TABLE "LeaveRequest" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "OvertimeRequest" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "CashAdvanceRequest" TO postgres;

-- Grant usage on sequences (for auto-incrementing IDs if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Verify permissions were granted
SELECT 
    tablename,
    tableowner,
    has_table_privilege('postgres', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('postgres', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('postgres', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('postgres', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('LeaveRequest', 'OvertimeRequest', 'CashAdvanceRequest');
