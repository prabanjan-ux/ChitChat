const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message',{

    text: {
        type:DataTypes.TEXT,
        allowNull: false
    },
    senderID: {
        type:DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    receiverID: {
        type:DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }

},{
    tableName: 'messages',
    timestamps:true
});

module.exports = Message;