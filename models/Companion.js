import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Companion = sequelize.define('Companion', {
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
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('family', 'friend', 'colleague', 'other'),
    defaultValue: 'friend'
  }
}, {
  tableName: 'travel_companions'
});

export default Companion;
