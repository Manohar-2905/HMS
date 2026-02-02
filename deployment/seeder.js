const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const { connectDB } = require('./config/db');
const { createHash } = require('./utils/encryption');

connectDB();

const importData = async () => {
    try {
        const adminExists = await User.findOne({ where: { emailHash: createHash('kumarmanohar6206@gmail.com') } });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const adminUser = {
            name: 'Manohar',
            email: 'kumarmanohar6206@gmail.com',
            password: '123456789', // This will be hashed by the pre-save middleware in User model
            role: 'admin',
            phone: '1234567890',
            address: 'Admin Address',
            roomType: 'N/A',
        };

        await User.create(adminUser);

        console.log('Admin User Imported!');
        console.log('Email:kumarmanohar6206@gmail.com');
        console.log('Password: 123456789');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
