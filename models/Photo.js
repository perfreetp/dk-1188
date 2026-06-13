import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  travel_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'travels',
      key: 'id'
    }
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  location_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  taken_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'photos'
});

export default Photo;
