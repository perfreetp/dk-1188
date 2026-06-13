import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TextSnippet = sequelize.define('TextSnippet', {
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
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'text_snippets'
});

export default TextSnippet;
