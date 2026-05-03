import { sequelize } from '../models/index.js';
import 'dotenv/config';

async function check() {
    try {
        const [results] = await sequelize.query("DESCRIBE user");
        console.log("SCHEMA_START");
        console.log(JSON.stringify(results, null, 2));
        console.log("SCHEMA_END");
    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
    }
}
check();
