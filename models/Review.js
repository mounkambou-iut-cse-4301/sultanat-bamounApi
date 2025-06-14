const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Review extends Model {}

Review.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  book_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'reviews',
      key: 'id'
    },
    validate: {
      // empêcher un reply d'avoir un reply
      isOneLevel(value) {
        if (value === this.id) {
          throw new Error("Un commentaire ne peut pas se répondre lui-même.");
        }
      }
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Review',
  tableName: 'reviews',
  timestamps: true,
  underscored: true
});
Review.hasMany(Review, {
  as: 'replies',
  foreignKey: 'parent_id'
});

Review.belongsTo(Review, {
  as: 'parent',
  foreignKey: 'parent_id'
});

module.exports = Review;
