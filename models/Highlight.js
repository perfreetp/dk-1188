import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Highlight = sequelize.define('Highlight', {
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('attraction', 'food', 'activity', 'reflection', 'other'),
    defaultValue: 'attraction'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'highlights'
});

export default Highlight;
