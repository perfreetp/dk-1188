import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Route = sequelize.define('Route', {
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
  distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '公里'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '分钟'
  },
  start_location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  end_location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  route_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式的路线轨迹数据'
  }
}, {
  tableName: 'routes'
});

export default Route;
