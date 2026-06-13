import express from 'express';
import { Anniversary, Travel } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const anniversaries = await Anniversary.findByUserId(req.user.id);
    res.json({ success: true, data: anniversaries });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', validate(schemas.createAnniversary), async (req, res) => {
  try {
    if (req.body.travel_id) {
      const travel = await Travel.findById(req.body.travel_id);
      if (!travel || travel.user_id !== req.user.id) {
        return res.status(400).json({ success: false, message: '无效的旅行' });
      }
    }
    const anniversary = await Anniversary.create({ user_id: req.user.id, ...req.body });
    res.status(201).json({ success: true, message: '纪念日创建成功', data: anniversary });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const anniversary = await Anniversary.findById(req.params.id);
    if (!anniversary) {
      return res.status(404).json({ success: false, message: '纪念日不存在' });
    }
    if (anniversary.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权修改该纪念日' });
    }
    const updatedAnniversary = await Anniversary.update(req.params.id, req.body);
    res.json({ success: true, message: '纪念日更新成功', data: updatedAnniversary });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const anniversary = await Anniversary.findById(req.params.id);
    if (!anniversary) {
      return res.status(404).json({ success: false, message: '纪念日不存在' });
    }
    if (anniversary.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该纪念日' });
    }
    await Anniversary.delete(req.params.id);
    res.json({ success: true, message: '纪念日删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const anniversaries = await Anniversary.findUpcoming(req.user.id, parseInt(days));
    const upcomingList = anniversaries.map(a => {
      const now = new Date();
      const daysUntil = Math.ceil((new Date(a.date) - now) / (1000 * 60 * 60 * 24));
      return { ...a, daysUntil, isToday: daysUntil === 0 };
    });
    res.json({ success: true, data: upcomingList });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
