const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class BookDownloadRequest extends Model {}

BookDownloadRequest.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  profession: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
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
  modelName: 'BookDownloadRequest',
  tableName: 'book_download_requests',
  timestamps: true,
  underscored: true
});

module.exports = BookDownloadRequest;
