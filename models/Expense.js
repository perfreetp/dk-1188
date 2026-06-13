import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Expense = sequelize.define('Expense', {
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
  category: {
    type: DataTypes.ENUM('accommodation', 'food', 'transport', 'shopping', 'entertainment', 'other'),
    defaultValue: 'other'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'CNY'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  notes: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'expenses'
});

export default Expense;
