const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
async function main() {
  const conn = await mysql.createConnection('mysql://root:ZcIiQHtTVgzVRXYVIslNvUcXDKIEdIKy@acela.proxy.rlwy.net:46204/railway');
  const hashed = await bcrypt.hash('Admin@1234', 12);
  await conn.execute('INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE email=email', ['admin001', 'admin@ikonex.ac.ke', hashed, 'Admin User', 'ADMIN']);
  console.log('Admin user created!');
  await conn.end();
}
main().catch(console.error);