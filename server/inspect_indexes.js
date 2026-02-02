const dotenv = require('dotenv');
dotenv.config();
const { sequelize } = require('./config/db');

async function checkIndexes() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');
        const [results, metadata] = await sequelize.query("SHOW INDEX FROM Users");
        console.log('Indexes on Users table:', results.length);
        results.forEach(idx => {
            console.log(`Key_name: ${idx.Key_name}, Column_name: ${idx.Column_name}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkIndexes();
