# Manual Database Migration Guide

## Prerequisites

- PostgreSQL installed and running
- Access to the HrisDb database
- Admin/superuser credentials for PostgreSQL

## Option 1: Using pgAdmin (GUI)

1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Navigate to: **Servers** → **Your Server** → **Databases** → **HrisDb**
4. Right-click on **HrisDb** → **Query Tool**
5. Open the file: `prisma/migrations/manual_filing_migration.sql`
6. Copy the entire SQL script
7. Paste it into the Query Tool
8. Click **Execute** (F5) or the ▶️ button
9. Check the **Messages** tab for any errors
10. If successful, you should see "Query returned successfully"

## Option 2: Using psql Command Line

### Windows:

```bash
# Open Command Prompt or PowerShell
cd C:\Users\CPDSC-MIS-25\Desktop\HRIS\Payroll-Management-System

# Run the migration
psql -U postgres -d HrisDb -f prisma/migrations/manual_filing_migration.sql
```

### If you need to enter password:

```bash
psql -U postgres -d HrisDb
# Enter password when prompted
# Then run:
\i prisma/migrations/manual_filing_migration.sql
```

## Option 3: Using Database Management Tool (DBeaver, DataGrip, etc.)

1. Connect to your HrisDb database
2. Open a new SQL Editor
3. Load the `manual_filing_migration.sql` file
4. Execute the script
5. Verify no errors occurred

## After Running the Migration

### 1. Verify Migration Success

Run this query to check if tables were created:

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('LeaveRequest', 'OvertimeRequest', 'CashAdvanceRequest');
```

You should see 3 rows returned.

### 2. Update Prisma Client

After the migration succeeds, run this command in your project directory:

```bash
npx prisma generate
```

This will update the Prisma Client to include the new models.

### 3. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Troubleshooting

### Error: "permission denied to create type"

**Solution:** You need superuser privileges. Try:

```bash
psql -U postgres -d HrisDb -f prisma/migrations/manual_filing_migration.sql
```

### Error: "type already exists"

**Solution:** The enums might already exist. You can either:

1. Skip the enum creation (comment out lines 10-36 in the SQL file)
2. Or drop existing enums first:

```sql
DROP TYPE IF EXISTS "LeaveType" CASCADE;
DROP TYPE IF EXISTS "RequestStatus" CASCADE;
DROP TYPE IF EXISTS "ApprovalStatus" CASCADE;
```

### Error: "relation already exists"

**Solution:** Tables might already exist. Either:

1. Drop them first (WARNING: This deletes data!):

```sql
DROP TABLE IF EXISTS "LeaveRequest" CASCADE;
DROP TABLE IF EXISTS "OvertimeRequest" CASCADE;
DROP TABLE IF EXISTS "CashAdvanceRequest" CASCADE;
```

2. Or modify the script to use `CREATE TABLE IF NOT EXISTS`

### Error: "foreign key constraint violation"

**Solution:** Make sure the `Employee` and `User` tables exist first.

## Verification Checklist

After migration, verify:

- [ ] 3 new enums created (LeaveType, RequestStatus, ApprovalStatus)
- [ ] 3 new tables created (LeaveRequest, OvertimeRequest, CashAdvanceRequest)
- [ ] Indexes created successfully
- [ ] Foreign key constraints added
- [ ] `npx prisma generate` runs without errors
- [ ] Development server starts without errors

## Next Steps

Once the migration is complete:

1. I'll continue creating the Overtime and Cash Advance controllers
2. Create the API routes for all three request types
3. Begin frontend implementation

Let me know when the migration is successful!
