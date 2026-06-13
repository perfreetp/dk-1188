import express from 'express';
import { Highlight, Travel } from '../models/index.js';
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
    const { featured_only } = req.query;
    const highlights = await Highlight.findByTravelId(req.params.id, featured_only === 'true');
    res.json({ success: true, data: highlights });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', validate(schemas.createHighlight), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权添加高光时刻' : '旅行不存在' });
    }
    const highlight = await Highlight.create({ travel_id: req.params.id, ...req.body });
    res.status(201).json({ success: true, message: '高光时刻添加成功', data: highlight });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/:highlightId', async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.highlightId);
    if (!highlight) {
      return res.status(404).json({ success: false, message: '高光时刻不存在' });
    }
    const travel = await Travel.findById(highlight.travel_id);
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权修改该高光时刻' });
    }
    const updatedHighlight = await Highlight.update(req.params.highlightId, req.body);
    res.json({ success: true, message: '高光时刻更新成功', data: updatedHighlight });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:highlightId', async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.highlightId);
    if (!highlight) {
      return res.status(404).json({ success: false, message: '高光时刻不存在' });
    }
    const travel = await Travel.findById(highlight.travel_id);
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该高光时刻' });
    }
    await Highlight.delete(req.params.highlightId);
    res.json({ success: true, message: '高光时刻删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
