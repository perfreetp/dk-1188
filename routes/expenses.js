import express from 'express';
import { Expense, Travel } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { calculateTotal, groupByCategory } from '../utils/helpers.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权访问该旅行' : '旅行不存在' });
    }
    const expenses = await Expense.findByTravelId(req.params.id);
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', validate(schemas.createExpense), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权添加花费记录' : '旅行不存在' });
    }
    const expense = await Expense.create({ travel_id: req.params.id, ...req.body });
    res.status(201).json({ success: true, message: '花费记录添加成功', data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权访问该旅行' : '旅行不存在' });
    }
    const expenses = await Expense.findByTravelId(req.params.id);
    const total = calculateTotal(expenses);
    const byCategory = groupByCategory(expenses, 'category');
    const currencies = {};
    expenses.forEach(e => {
      const currency = e.currency || 'CNY';
      currencies[currency] = (currencies[currency] || 0) + parseFloat(e.amount) || 0;
    });
    res.json({ success: true, data: { total, currencies, byCategory, count: expenses.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:expenseId', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ success: false, message: '花费记录不存在' });
    }
    const travel = await Travel.findById(expense.travel_id);
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该花费记录' });
    }
    await Expense.delete(req.params.expenseId);
    res.json({ success: true, message: '花费记录删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
