import express from 'express';
import { Restaurant, Travel } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权访问该旅行' : '旅行不存在' });
    }
    const restaurants = await Restaurant.findByTravelId(req.params.id);
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error('获取餐厅列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', validate(schemas.createRestaurant), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权添加餐厅' : '旅行不存在' });
    }
    const restaurant = await Restaurant.create({ travel_id: req.params.id, ...req.body });
    res.status(201).json({ success: true, message: '餐厅添加成功', data: restaurant });
  } catch (error) {
    console.error('添加餐厅错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:restaurantId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: '餐厅不存在' });
    }
    const travel = await Travel.findById(restaurant.travel_id);
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该餐厅' });
    }
    await Restaurant.delete(req.params.restaurantId);
    res.json({ success: true, message: '餐厅删除成功' });
  } catch (error) {
    console.error('删除餐厅错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
