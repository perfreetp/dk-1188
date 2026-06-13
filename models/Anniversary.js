import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Anniversary = sequelize.define('Anniversary', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  travel_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'travels',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reminder_days: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
    comment: '提前提醒天数'
  },
  frequency: {
    type: DataTypes.ENUM('once', 'yearly', 'monthly'),
    defaultValue: 'yearly'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'anniversaries'
});

export default Anniversary;
