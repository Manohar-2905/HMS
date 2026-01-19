const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        $or: [
            { email: email },
            { name: email }
        ]
    });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Your account is pending admin approval. Please wait for verification.' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo: user.photo,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
    const {
        name, email, password, role, phone, address, roomType, totalAmount, paidAmount,
        dob, fatherName, fatherOccupation, fatherPhone, motherName, motherPhone,
        aadharNo, visitors, university, registrationNo
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    let photoUrl = '';
    if (req.file) {
        try {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image', folder: 'users' },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    Readable.from(fileBuffer).pipe(stream);
                });
            };
            const result = await streamUpload(req.file.buffer);
            photoUrl = result.secure_url;
        } catch (error) {
            console.error('Photo upload failed', error);
        }
    }

    const remainingAmount = totalAmount - paidAmount;

    // Handle visitors array if sent as string (e.g. JSON stringified or comma separated)
    let visitorsList = visitors;
    if (typeof visitors === 'string') {
        try {
            visitorsList = JSON.parse(visitors);
        } catch (e) {
            visitorsList = visitors.split(',').map(v => v.trim());
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        phone,
        address,
        roomType,
        totalAmount,
        paidAmount,
        remainingAmount,
        dob,
        fatherName,
        fatherOccupation,
        fatherPhone,
        motherName,
        motherPhone,
        aadharNo,
        visitors: visitorsList,
        university,
        registrationNo,
        photo: photoUrl
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo: user.photo,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Request a new registration (Public)
// @route   POST /api/auth/register-request
// @access  Public
const requestRegistration = async (req, res) => {
    const {
        name, email, password, phone, address,
        dob, fatherName, fatherOccupation, fatherPhone, motherName, motherPhone,
        aadharNo, university, registrationNo
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    let photoUrl = '';
    if (req.file) {
        try {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image', folder: 'users' },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    Readable.from(fileBuffer).pipe(stream);
                });
            };
            const result = await streamUpload(req.file.buffer);
            photoUrl = result.secure_url;
        } catch (error) {
            console.error('Photo upload failed', error);
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'user',
        phone,
        address,
        roomType: 'Unassigned',
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        dob,
        fatherName,
        fatherOccupation,
        fatherPhone,
        motherName,
        motherPhone,
        aadharNo,
        university,
        registrationNo,
        photo: photoUrl,
        isVerified: false,
        isPendingApproval: true
    });

    if (user) {
        res.status(201).json({
            message: 'Registration request submitted. Please wait for admin approval.'
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Get all pending registrations (Admin only)
// @route   GET /api/auth/pending-users
// @access  Private/Admin
const getPendingUsers = async (req, res) => {
    const users = await User.find({ isPendingApproval: true, isVerified: false });
    res.json(users);
};

// @desc    Approve/Verify a user (Admin only)
// @route   POST /api/auth/approve-user/:id
// @access  Private/Admin
const approveUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isVerified = true;
        user.isPendingApproval = false;
        await user.save();
        res.json({ message: 'User approved successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } });
    res.json(users);
};

const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Set OTP and expiration (10 minutes)
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const message = `Your password reset Code is: ${otp}\n\nThis code will expire in 10 minutes.`;

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f5;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #ea580c; text-align: center; margin-bottom: 30px;">Yashoda Bhawan</h2>
                <p style="color: #333; font-size: 16px;">Hello,</p>
                <p style="color: #333; font-size: 16px;">We received a request to reset your password. Use the code below to proceed:</p>
                <div style="background-color: #fff7ed; border: 2px dashed #ea580c; padding: 15px; text-align: center; margin: 25px 0; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ea580c;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
            </div>
        </div>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset Code - Yashoda Bhawan',
            message,
            html,
        });

        res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP verified' });
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired Code' });
    }

    // Set new password (pre-save middleware will hash it)
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
};

// @desc    Initiate Change Password (Verify Old & Send OTP)
// @route   POST /api/auth/change-password-initiate
// @access  Private
const initiateChangePassword = async (req, res) => {
    try {
        const { oldPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(oldPassword))) {
            // Generate 4 digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            // Set OTP and expiration (10 minutes)
            user.resetPasswordOtp = otp;
            user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

            await user.save();

            const message = `Your password change verification Code is: ${otp}\n\nThis code will expire in 10 minutes.`;

            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f5;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #ea580c; text-align: center; margin-bottom: 30px;">Yashoda Bhawan</h2>
                    <p style="color: #333; font-size: 16px;">Hello ${user.name},</p>
                    <p style="color: #333; font-size: 16px;">You requested to change your password. Use the verification code below:</p>
                    <div style="background-color: #fff7ed; border: 2px dashed #ea580c; padding: 15px; text-align: center; margin: 25px 0; border-radius: 8px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ea580c;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
                </div>
            </div>
            `;

            await sendEmail({
                email: user.email,
                subject: 'Change Password Verification - Yashoda Bhawan',
                message,
                html,
            });

            res.status(200).json({ success: true, message: 'OTP sent to email' });
        } else {
            res.status(401).json({ message: 'Invalid old password' });
        }
    } catch (error) {
        console.error('Change password initiate error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Complete Change Password (Verify OTP & Update Password)
// @route   POST /api/auth/change-password-complete
// @access  Private
const completeChangePassword = async (req, res) => {
    const { otp, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (
        user &&
        user.resetPasswordOtp === otp &&
        user.resetPasswordOtpExpire > Date.now()
    ) {
        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            photo: updatedUser.photo,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
    }
};

const { deleteFile } = require('../utils/cloudinaryHelper');

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.photo) {
            await deleteFile(user.photo, 'users');
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user details & payment
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.roomType = req.body.roomType || user.roomType;
        user.fatherName = req.body.fatherName || user.fatherName;
        user.fatherPhone = req.body.fatherPhone || user.fatherPhone;
        user.motherName = req.body.motherName || user.motherName;
        user.motherPhone = req.body.motherPhone || user.motherPhone;
        user.dob = req.body.dob || user.dob;
        user.aadharNo = req.body.aadharNo || user.aadharNo;
        user.university = req.body.university || user.university;
        user.registrationNo = req.body.registrationNo || user.registrationNo;

        // Handle Visitors update if provided
        if (req.body.visitors) {
            let visitorsList = req.body.visitors;
            if (typeof req.body.visitors === 'string') {
                try {
                    visitorsList = JSON.parse(req.body.visitors);
                } catch (e) {
                    visitorsList = req.body.visitors.split(',').map(v => v.trim());
                }
            }
            user.visitors = visitorsList;
        }

        // Handle Payment Update (Incremental)
        if (req.body.paymentUpdate) {
            const addedAmount = Number(req.body.paymentUpdate);
            if (!isNaN(addedAmount)) {
                user.paidAmount = (user.paidAmount || 0) + addedAmount;
            }
        }

        // Allow manual override of total/paid if specifically passed (not just increment)
        if (req.body.totalAmount !== undefined) user.totalAmount = Number(req.body.totalAmount);
        if (req.body.paidAmount !== undefined && !req.body.paymentUpdate) user.paidAmount = Number(req.body.paidAmount);

        // Handle photo update
        if (req.file) {
            try {
                // Delete old photo if it exists
                if (user.photo) {
                    await deleteFile(user.photo, 'users');
                }

                // Upload new photo
                const streamUpload = (fileBuffer) => {
                    return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            { resource_type: 'image', folder: 'users' },
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        Readable.from(fileBuffer).pipe(stream);
                    });
                };
                const result = await streamUpload(req.file.buffer);
                user.photo = result.secure_url;
            } catch (error) {
                console.error('Photo update failed', error);
            }
        }

        // Recalculate remaining
        user.remainingAmount = user.totalAmount - user.paidAmount;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
            // Send back full object for UI update
            phone: updatedUser.phone,
            roomType: updatedUser.roomType,
            totalAmount: updatedUser.totalAmount,
            paidAmount: updatedUser.paidAmount,
            remainingAmount: updatedUser.remainingAmount,
            photo: updatedUser.photo
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    requestRegistration,
    getPendingUsers,
    approveUser,
    getUsers,
    forgotPassword,
    verifyOtp,
    resetPassword,
    initiateChangePassword,
    completeChangePassword,
    deleteUser,
    updateUser
};
