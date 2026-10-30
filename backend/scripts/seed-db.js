const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedDatabase() {
  console.log('🌱 Starting NEST & NOVA Database Seeding...');
  
  const connectionConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nest_and_nova',
    multipleStatements: true
  };

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log(` Connected to MySQL database "${connectionConfig.database}"`);

    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log(' Executing seed.sql...');
    await connection.query(seedSql);
    console.log(' Database seeded with sample products, categories, reviews, and admin account.');

    await connection.end();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
