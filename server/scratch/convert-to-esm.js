import fs from 'fs';
import path from 'path';

const convertToESM = (dir) => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'index.js');
    files.forEach(f => {
        const filePath = path.join(dir, f);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace requires with imports
        content = content.replace(/const { DataTypes } = require\(['"]sequelize['"]\);/g, "import { DataTypes } from 'sequelize';");
        content = content.replace(/const sequelize = require\(['"]\.\.\/config\/database['"]\);/g, "import sequelize from '../config/database.js';");
        content = content.replace(/const express = require\(['"]express['"]\);/g, "import express from 'express';");
        content = content.replace(/const router = express\.Router\(\);/g, "const router = express.Router();");
        
        // Specific for routes
        content = content.replace(/const { (.*) } = require\(['"]\.\.\/controllers\/(.*)['"]\);/g, (match, p1, p2) => {
            return `import { ${p1} } from '../controllers/${p2}${p2.endsWith('.js') ? '' : '.js'}';`;
        });
        content = content.replace(/const (.*) = require\(['"]\.\.\/controllers\/(.*)['"]\);/g, (match, p1, p2) => {
            return `import ${p1} from '../controllers/${p2}${p2.endsWith('.js') ? '' : '.js'}';`;
        });
        content = content.replace(/const { (.*) } = require\(['"]\.\.\/middleware\/(.*)['"]\);/g, (match, p1, p2) => {
            return `import { ${p1} } from '../middleware/${p2}${p2.endsWith('.js') ? '' : '.js'}';`;
        });

        // Replace exports
        content = content.replace(/module\.exports = (\w+);/g, "export default $1;");
        content = content.replace(/module\.exports = {([\s\S]*?)};/g, (match, p1) => {
           // This handles module.exports = { a, b, c };
           return `export {${p1}};`;
        });

        fs.writeFileSync(filePath, content);
    });
};

console.log('Converting models...');
convertToESM('models');
console.log('Converting routes...');
convertToESM('routes');
console.log('Done.');
