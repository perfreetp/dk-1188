import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FamilyMember = sequelize.define('FamilyMember', {
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
  member_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '关系描述，如：配偶、父母、子女等'
  }
}, {
  tableName: 'family_members'
});

export default FamilyMember;
