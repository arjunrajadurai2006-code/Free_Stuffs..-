const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('⚡ Starting NEST & NOVA MySQL Database Setup...');
  
  const connectionConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log(` Connected to MySQL server at ${connectionConfig.host}:${connectionConfig.port}`);

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log(' Executing schema.sql...');
    await connection.query(schemaSql);
    console.log(' Database schema applied successfully.');

    await connection.end();
    console.log('🎉 Setup completed! Run "npm run db:seed" to load sample products.');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
