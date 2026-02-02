const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { Op } = require('sequelize');
const { createHash } = require('../utils/encryption');

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
        where: {
            [Op.or]: [
                { emailHash: createHash(email) },
                { nameHash: createHash(email) }
            ]
        }
    });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Your account is pending admin approval. Please wait for verification.' });
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo: user.photo,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
    try {
        const {
            name, email, password, role, phone, address, roomType, totalAmount, paidAmount,
            dob, fatherName, fatherOccupation, fatherPhone, motherName, motherPhone,
            aadharNo, visitors, university, registrationNo
        } = req.body;

        const userExists = await User.findOne({ where: { emailHash: createHash(email) } });

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

        const remainingAmount = (Number(totalAmount) || 0) - (Number(paidAmount) || 0);

        // Handle visitors array if sent as string (e.g. JSON stringified or comma separated)
        let visitorsList = visitors;
        if (typeof visitors === 'string' && visitors.trim()) {
            try {
                visitorsList = JSON.parse(visitors);
            } catch (e) {
                visitorsList = visitors.split(',').map(v => v.trim());
            }
        } else if (!visitors) {
            visitorsList = [];
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            phone,
            address,
            roomType: roomType || 'Unassigned',
            totalAmount: Number(totalAmount) || 0,
            paidAmount: Number(paidAmount) || 0,
            remainingAmount: remainingAmount,
            dob: dob || null,
            fatherName,
            fatherOccupation,
            fatherPhone,
            motherName,
            motherPhone,
            aadharNo,
            visitors: Array.isArray(visitorsList) ? visitorsList : [],
            university,
            registrationNo,
            photo: photoUrl
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                photo: user.photo,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Request a new registration (Public)
// @route   POST /api/auth/register-request
// @access  Public
const requestRegistration = async (req, res) => {
    try {
        const {
            name, email, password, phone, address,
            dob, fatherName, fatherOccupation, fatherPhone, motherName, motherPhone,
            aadharNo, university, registrationNo
        } = req.body;

        const userExists = await User.findOne({ where: { emailHash: createHash(email) } });

        if (userExists) {
            // If user exists but is not email verified, we can resend OTP
            if (!userExists.isEmailVerified) {
                // Generate 4 digit OTP
                const otp = Math.floor(1000 + Math.random() * 9000).toString();
                userExists.registrationOtp = otp;
                userExists.registrationOtpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
                await userExists.save();

                // Send Email
                const message = `Your registration verification Code is: ${otp}\n\nThis code will expire in 10 minutes.`;
                const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f5;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #ea580c; text-align: center; margin-bottom: 30px;">Yashoda Bhawan</h2>
                        <h3 style="color: #333; text-align: center;">Welcome to Yashoda Bhawan!</h3>
                        <p style="color: #333; font-size: 16px;">Hello ${name || 'User'},</p>
                        <p style="color: #333; font-size: 16px;">Thank you for registering. Please use the verification code below to complete your registration request:</p>
                        <div style="background-color: #fff7ed; border: 2px dashed #ea580c; padding: 15px; text-align: center; margin: 25px 0; border-radius: 8px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ea580c;">${otp}</span>
                        </div>
                        <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">Once verified, your request will be sent to the admin for approval.</p>
                    </div>
                </div>
                `;

                try {
                    await sendEmail({
                        email: userExists.email,
                        subject: 'Verify Your Registration - Yashoda Bhawan',
                        message,
                        html,
                    });
                    return res.status(200).json({ message: 'Verification code resent. Please check your email.' });
                } catch (emailError) {
                    console.error('Email resend failed:', emailError);
                    return res.status(200).json({ message: 'Registration restarted. Error sending email, please try again.' });
                }
            }
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

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

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
            dob: dob || null,
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
            isPendingApproval: true,
            isEmailVerified: false,
            registrationOtp: otp,
            registrationOtpExpire: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        });

        if (user) {
            // Send Email
            const message = `Your registration verification Code is: ${otp}\n\nThis code will expire in 10 minutes.`;
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f5;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #ea580c; text-align: center; margin-bottom: 30px;">Yashoda Bhawan</h2>
                    <h3 style="color: #333; text-align: center;">Welcome to Yashoda Bhawan!</h3>
                    <p style="color: #333; font-size: 16px;">Hello ${name},</p>
                    <p style="color: #333; font-size: 16px;">Thank you for registering. Please use the verification code below to complete your registration request:</p>
                    <div style="background-color: #fff7ed; border: 2px dashed #ea580c; padding: 15px; text-align: center; margin: 25px 0; border-radius: 8px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ea580c;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">Once verified, your request will be sent to the admin for approval.</p>
                </div>
            </div>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify Your Registration - Yashoda Bhawan',
                    message,
                    html,
                });
                res.status(201).json({
                    message: 'Verification code sent to your email.'
                });
            } catch (emailError) {
                console.error('Email send failed:', emailError);
                res.status(201).json({
                    message: 'Registration initiated. If email not received, try resending in a few moments.'
                });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Request registration error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all pending registrations (Admin only)
// @route   GET /api/auth/pending-users
// @access  Private/Admin
const getPendingUsers = async (req, res) => {
    const users = await User.findAll({
        where: {
            isPendingApproval: true,
            isVerified: false,
            isEmailVerified: true // Only show users who verified their email
        }
    });
    res.json(users);
};

// @desc    Approve/Verify a user (Admin only)
// @route   POST /api/auth/approve-user/:id
// @access  Private/Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (user) {
            user.isVerified = true;
            user.isPendingApproval = false;

            // Handle optional payment info during approval
            if (req.body.totalAmount !== undefined) user.totalAmount = Number(req.body.totalAmount) || 0;
            if (req.body.paidAmount !== undefined) {
                const initialPaid = Number(req.body.paidAmount) || 0;
                user.paidAmount = initialPaid;

                // Record initial payment in history if > 0
                if (initialPaid > 0) {
                    const history = user.paymentHistory ? [...user.paymentHistory] : [];
                    history.push({
                        amount: initialPaid,
                        date: new Date(),
                        remarks: 'Initial payment upon approval'
                    });
                    user.paymentHistory = history;
                }
            }

            user.remainingAmount = (user.totalAmount || 0) - (user.paidAmount || 0);

            await user.save();
            res.json({ message: 'User approved successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.findAll({
        where: {
            role: { [Op.ne]: 'admin' }
        }
    });
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
        const user = await User.findOne({ where: { emailHash: createHash(email) } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Set OTP and expiration (10 minutes)
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);

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
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({
        where: {
            emailHash: createHash(email),
            resetPasswordOtp: otp,
            resetPasswordOtpExpire: { [Op.gt]: new Date() }
        }
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
        where: {
            emailHash: createHash(email),
            resetPasswordOtp: otp,
            resetPasswordOtpExpire: { [Op.gt]: new Date() }
        }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired Code' });
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpire = null;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
};

// @desc    Initiate Change Password (Verify Old & Send OTP)
// @route   POST /api/auth/change-password-initiate
// @access  Private
const initiateChangePassword = async (req, res) => {
    try {
        const { oldPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (user && (await user.matchPassword(oldPassword))) {
            // Generate 4 digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            // Set OTP and expiration (10 minutes)
            user.resetPasswordOtp = otp;
            user.resetPasswordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);

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
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// @desc    Complete Change Password (Verify OTP & Update Password)
// @route   POST /api/auth/change-password-complete
// @access  Private
const completeChangePassword = async (req, res) => {
    const { otp, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (
        user &&
        user.resetPasswordOtp === otp &&
        user.resetPasswordOtpExpire > new Date()
    ) {
        user.password = newPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpire = null;

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            photo: updatedUser.photo,
            token: generateToken(updatedUser.id),
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
    const user = await User.findByPk(req.params.id);

    if (user) {
        if (user.photo) {
            await deleteFile(user.photo, 'image');
        }
        await user.destroy();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user details & payment
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

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
                user.visitors = Array.isArray(visitorsList) ? visitorsList : user.visitors;
            }

            // Handle Payment Update (Incremental)
            if (req.body.paymentUpdate) {
                const addedAmount = Number(req.body.paymentUpdate);
                if (!isNaN(addedAmount)) {
                    user.paidAmount = (user.paidAmount || 0) + addedAmount;

                    // Record in history
                    const history = user.paymentHistory ? [...user.paymentHistory] : [];
                    history.push({
                        amount: addedAmount,
                        date: new Date(),
                        remarks: req.body.remarks || 'Incremental payment'
                    });
                    user.paymentHistory = history;
                }
            }

            // Allow manual override of total/paid if specifically passed (not just increment)
            if (req.body.totalAmount !== undefined) user.totalAmount = Number(req.body.totalAmount) || 0;
            if (req.body.paidAmount !== undefined && !req.body.paymentUpdate) {
                const newPaid = Number(req.body.paidAmount) || 0;
                const oldPaid = user.paidAmount || 0;
                const diff = newPaid - oldPaid;

                // Log manual correction if changed
                if (diff !== 0) {
                    const history = user.paymentHistory ? [...user.paymentHistory] : [];
                    history.push({
                        amount: diff,
                        date: new Date(),
                        remarks: req.body.remarks || 'Manual Correction'
                    });
                    user.paymentHistory = history;
                }
                user.paidAmount = newPaid;
            }

            // Handle photo update
            if (req.file) {
                try {
                    // Delete old photo if it exists
                    if (user.photo) {
                        await deleteFile(user.photo, 'image');
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
            user.remainingAmount = (Number(user.totalAmount) || 0) - (Number(user.paidAmount) || 0);

            const updatedUser = await user.save();

            res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser.id),
                // Send back full object for UI update
                phone: updatedUser.phone,
                roomType: updatedUser.roomType,
                totalAmount: updatedUser.totalAmount,
                paidAmount: updatedUser.paidAmount,
                remainingAmount: updatedUser.remainingAmount,
                photo: updatedUser.photo,
                paymentHistory: updatedUser.paymentHistory
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (user) {
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo: user.photo,
            phone: user.phone,
            address: user.address,
            roomType: user.roomType,
            totalAmount: user.totalAmount,
            paidAmount: user.paidAmount,
            remainingAmount: user.remainingAmount,
            paymentHistory: user.paymentHistory,
            university: user.university,
            registrationNo: user.registrationNo,
            dob: user.dob,
            fatherName: user.fatherName,
            fatherPhone: user.fatherPhone,
            motherName: user.motherName,
            motherPhone: user.motherPhone,
            aadharNo: user.aadharNo,
            visitors: user.visitors
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const getUserCount = async (req, res) => {
    try {
        const count = await User.count();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user count' });
    }
};

const verifyRegistrationOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({
            where: {
                emailHash: createHash(email),
                registrationOtp: otp,
                registrationOtpExpire: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired Code' });
        }

        user.isEmailVerified = true;
        user.registrationOtp = null;
        user.registrationOtpExpire = null;

        await user.save();

        res.status(200).json({ message: 'Email verified! Your registration is now pending admin approval.' });
    } catch (error) {
        console.error('Verify registration OTP error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    requestRegistration,
    getPendingUsers,
    approveUser,
    getUsers,
    getUserProfile,
    forgotPassword,
    verifyOtp,
    resetPassword,
    initiateChangePassword,
    completeChangePassword,
    deleteUser,
    updateUser,
    getUserCount,
    verifyRegistrationOtp
};
