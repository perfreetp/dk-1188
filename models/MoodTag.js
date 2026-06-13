import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MoodTag = sequelize.define('MoodTag', {
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
  tag_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  is_custom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'mood_tags'
});

export const PRESET_MOODS = [
  '开心', '感动', '疲惫', '兴奋', '平静', '惊讶', '温馨', '浪漫',
  'happy', 'touched', 'tired', 'excited', 'peaceful', 'surprised', 'warm', 'romantic'
];

export default MoodTag;
