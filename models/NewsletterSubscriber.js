const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class NewsletterSubscriber extends Model {}

NewsletterSubscriber.init({
  name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  surname: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  domain: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true
    }
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
  modelName: 'NewsletterSubscriber',
  tableName: 'NewsletterSubscribers',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['email'] }
  ]
});

module.exports = NewsletterSubscriber;
