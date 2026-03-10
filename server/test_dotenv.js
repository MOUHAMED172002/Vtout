require('dotenv').config();
console.log('Dotenv loaded');
console.log('DB URL:', process.env.MYSQL_DATABASE_URL);
process.exit(0);
