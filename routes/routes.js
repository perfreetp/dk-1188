import express from 'express';
import { Route, Travel } from '../models/index.js';
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
    const routes = await Route.findByTravelId(req.params.id);
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', validate(schemas.createRoute), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权添加路线' : '旅行不存在' });
    }
    const route = await Route.create({ travel_id: req.params.id, ...req.body });
    res.status(201).json({ success: true, message: '路线添加成功', data: route });
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
    const routes = await Route.findByTravelId(req.params.id);
    const totalDistance = routes.reduce((sum, r) => sum + (parseFloat(r.distance) || 0), 0);
    const totalDuration = routes.reduce((sum, r) => sum + (r.duration || 0), 0);
    res.json({ success: true, data: { totalDistance, totalDuration, routeCount: routes.length, routes } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:routeId', async (req, res) => {
  try {
    const route = await Route.findById(req.params.routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: '路线不存在' });
    }
    const travel = await Travel.findById(route.travel_id);
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该路线' });
    }
    await Route.delete(req.params.routeId);
    res.json({ success: true, message: '路线删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
