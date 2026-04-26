import sequelize from './config/database.js';

async function defaultClean() {
  try {
    console.log('Disabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    const [tables] = await sequelize.query('SHOW TABLES');
    
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      
      // Keep ONLY categories
      if (
        tableName === 'categories' ||
        tableName === 'SequelizeMeta'
      ) {
         console.log(`Keeping: ${tableName}`);
         continue;
      }

      console.log(`Clearing table: ${tableName}...`);
      try {
         await sequelize.query(`TRUNCATE TABLE \`${tableName}\`;`);
      } catch (e) {
         console.log(`-> Skipped ${tableName}: ${e.message}`);
      }
    }

    console.log('Re-enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('Database cleaned completely and cleanly!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

defaultClean();
