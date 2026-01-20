const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'user'], default: 'user' },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        roomType: { type: String, required: true },
        dob: { type: Date },
        fatherName: { type: String },
        fatherOccupation: { type: String },
        fatherPhone: { type: String },
        motherName: { type: String },
        motherPhone: { type: String },
        aadharNo: { type: String },
        visitors: [{ type: String }],
        university: { type: String },
        registrationNo: { type: String },
        photo: { type: String }, // URL field for photo
        totalAmount: { type: Number, default: 0 },
        paidAmount: { type: Number, default: 0 },
        remainingAmount: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: true },
        isPendingApproval: { type: Boolean, default: false },
        resetPasswordOtp: { type: String },
        resetPasswordOtpExpire: { type: Date },
        paymentHistory: [
            {
                amount: { type: Number, required: true },
                date: { type: Date, default: Date.now },
                remarks: { type: String }
            }
        ],
    },
    { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
