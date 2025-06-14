const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ContactMessage extends Model {}

ContactMessage.init({
  first_name: { 
    type: DataTypes.STRING, 
    allowNull: false,
  },
  last_name: { 
    type: DataTypes.STRING, 
    allowNull: false,
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false,
  },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: false,
  },
  message: { 
    type: DataTypes.TEXT, 
    allowNull: false,
  },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
  sequelize,
  modelName: 'ContactMessage',
  tableName: 'ContactMessages',
  timestamps: true,
  underscored: true
});

module.exports = ContactMessage;
