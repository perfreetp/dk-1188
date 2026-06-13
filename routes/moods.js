import express from 'express';
import { MoodTag, Travel } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const PRESET_MOODS = ['开心', '感动', '疲惫', '兴奋', '平静', '惊讶', '温馨', '浪漫', 'happy', 'touched', 'tired', 'excited', 'peaceful', 'surprised', 'warm', 'romantic'];

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权访问该旅行' : '旅行不存在' });
    }
    const moods = await MoodTag.findByTravelId(req.params.id);
    res.json({ success: true, data: moods });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', validate(schemas.createMood), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权添加心情标签' : '旅行不存在' });
    }
    const mood = await MoodTag.create({ travel_id: req.params.id, ...req.body });
    res.status(201).json({ success: true, message: '心情标签添加成功', data: mood });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/presets', (req, res) => {
  res.json({ success: true, data: PRESET_MOODS });
});

router.delete('/:moodId', async (req, res) => {
  try {
    const mood = await MoodTag.findById(req.params.moodId);
    if (!mood) {
      return res.status(404).json({ success: false, message: '心情标签不存在' });
    }
    const travel = await Travel.findById(mood.travel_id);
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该心情标签' });
    }
    await MoodTag.delete(req.params.moodId);
    res.json({ success: true, message: '心情标签删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
