import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = await bcrypt.hash(password, 10);

console.log('Password hash for admin123:');
console.log(hash);
console.log('\nCopy this hash and use it in the SQL INSERT statement in prisma/seed_admin.sql');
