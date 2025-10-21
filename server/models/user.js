const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User',{
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'users',
    timestamps:true,
    hooks:{
        beforeCreate: async(user)=>{
            if(user.password) {
                const salt = await bcrypt.genSalt(10);
                // FIX: Changed 'users.password' to 'user.password'
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// --- ADDED THIS METHOD ---
// This adds an 'isValidPassword' method to every User instance
// It's used by auth.js to compare the login password with the hashed password
User.prototype.isValidPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = User;