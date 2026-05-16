import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve("./.env") });

import { sequelize, Config } from "./server/models/index.js";

async function deleteConfigs() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB");
    
    const res1 = await Config.destroy({ where: { key: 'base_delivery_fee' } });
    const res2 = await Config.destroy({ where: { key: 'commission_rate' } });
    
    console.log(`Deleted ${res1} base_delivery_fee records`);
    console.log(`Deleted ${res2} commission_rate records`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

deleteConfigs();
