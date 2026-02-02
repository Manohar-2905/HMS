const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const { connectDB } = require('./config/db');
const { createHash } = require('./utils/encryption');
connectDB();

const createAdmin = async () => {
    try {
        const email = 'admin@hms.com';
        const password = 'admin123';
        const userExists = await User.findOne({ where: { emailHash: createHash(email) } });

        if (userExists) {
            console.log('Admin user already exists!');
            console.log(`Email: ${email}`);
            process.exit();
        }

        const adminUser = await User.create({
            name: 'System Admin',
            email: email,
            password: password,
            role: 'admin',
            phone: '0000000000',
            address: 'System',
            roomType: 'N/A',
            paidAmount: 0,
            remainingAmount: 0
        });

        console.log('Admin Created Successfully!');
        console.log(`Email: ${adminUser.email}`);
        console.log(`Password: ${password}`);
        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
