import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Travel = sequelize.define('Travel', {
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
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ongoing', 'completed', 'archived'),
    defaultValue: 'ongoing'
  },
  privacy_level: {
    type: DataTypes.ENUM('public', 'private', 'password_protected', 'family'),
    defaultValue: 'private'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'travels'
});

export default Travel;
