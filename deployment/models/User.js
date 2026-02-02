const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt, createHash } = require('../utils/encryption');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return decrypt(this.getDataValue('name'));
        },
        set(value) {
            this.setDataValue('name', encrypt(value));
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return decrypt(this.getDataValue('email'));
        },
        set(value) {
            this.setDataValue('email', encrypt(value));
        }
    },
    emailHash: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    nameHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return decrypt(this.getDataValue('phone'));
        },
        set(value) {
            this.setDataValue('phone', encrypt(value));
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return decrypt(this.getDataValue('address'));
        },
        set(value) {
            this.setDataValue('address', encrypt(value));
        }
    },
    roomType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dob: {
        type: DataTypes.DATEONLY,
    },
    fatherName: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('fatherName'));
        },
        set(value) {
            this.setDataValue('fatherName', encrypt(value));
        }
    },
    fatherOccupation: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('fatherOccupation'));
        },
        set(value) {
            this.setDataValue('fatherOccupation', encrypt(value));
        }
    },
    fatherPhone: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('fatherPhone'));
        },
        set(value) {
            this.setDataValue('fatherPhone', encrypt(value));
        }
    },
    motherName: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('motherName'));
        },
        set(value) {
            this.setDataValue('motherName', encrypt(value));
        }
    },
    motherPhone: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('motherPhone'));
        },
        set(value) {
            this.setDataValue('motherPhone', encrypt(value));
        }
    },
    bloodGroup: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('bloodGroup'));
        },
        set(value) {
            this.setDataValue('bloodGroup', encrypt(value));
        }
    },
    aadharNo: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('aadharNo'));
        },
        set(value) {
            this.setDataValue('aadharNo', encrypt(value));
        }
    },
    visitors: {
        type: DataTypes.JSON, // Stores array of visitor names
        defaultValue: [],
    },
    university: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('university'));
        },
        set(value) {
            this.setDataValue('university', encrypt(value));
        }
    },
    registrationNo: {
        type: DataTypes.STRING,
        get() {
            return decrypt(this.getDataValue('registrationNo'));
        },
        set(value) {
            this.setDataValue('registrationNo', encrypt(value));
        }
    },
    photo: {
        type: DataTypes.STRING,
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    paidAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    remainingAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isPendingApproval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    resetPasswordOtp: {
        type: DataTypes.STRING,
    },
    resetPasswordOtpExpire: {
        type: DataTypes.DATE,
    },
    registrationOtp: {
        type: DataTypes.STRING,
    },
    registrationOtpExpire: {
        type: DataTypes.DATE,
    },
    paymentHistory: {
        type: DataTypes.JSON, // Stores array of payment objects
        defaultValue: [],
    },
}, {
    timestamps: true,
    hooks: {
        beforeValidate: (user) => {
            // Ensure hashes are updated based on decrypted values
            if (user.changed('email') || !user.emailHash) {
                user.emailHash = createHash(user.email);
            }
            if (user.changed('name') || !user.nameHash) {
                user.nameHash = createHash(user.name);
            }
            if (user.changed('phone') || !user.phoneHash) {
                user.phoneHash = createHash(user.phone);
            }
        },
        beforeSave: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
