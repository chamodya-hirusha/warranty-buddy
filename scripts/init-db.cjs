const mysql = require('mysql2/promise');
const { execSync } = require('child_process');
require('dotenv').config();

async function init() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set in .env");
    process.exit(1);
  }

  // Parse URL: mysql://user:password@host:port/database
  let user, password, host, port, database;
  try {
    const dbUrl = new URL(url);
    user = dbUrl.username;
    password = decodeURIComponent(dbUrl.password);
    host = dbUrl.hostname;
    port = parseInt(dbUrl.port, 10) || 3306;
    database = dbUrl.pathname.slice(1);
  } catch (err) {
    console.error("Invalid DATABASE_URL format");
    process.exit(1);
  }

  try {
    // Connect without DB
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    console.log(`Checking if database ${database} exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(`Database ${database} is ready.`);
    await connection.end();

    // Run Prisma DB Push
    console.log("Running Prisma DB Push to create tables...");
    execSync('npx prisma db push', { stdio: 'inherit' });

    // Run Seed
    console.log("Running Prisma Seed...");
    execSync('npx prisma db seed', { stdio: 'inherit' });

    console.log("Database setup complete!");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

init();
