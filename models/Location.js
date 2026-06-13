import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Location = sequelize.define('Location', {
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
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('hotel', 'restaurant', 'attraction', 'shopping', 'transport', 'other'),
    defaultValue: 'other'
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'locations'
});

export default Location;
