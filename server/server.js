const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

console.log('--- Email Config Check ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('EMAIL_SERVICE_MODE:', process.env.EMAIL_SERVICE_MODE);
console.log('---------------------------');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const noteRoutes = require('./routes/noteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/uploads', express.static('uploads'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.use((req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});