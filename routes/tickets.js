import express from 'express';
import { Ticket, Travel } from '../models/index.js';
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
    const tickets = await Ticket.findByTravelId(req.params.id);
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', validate(schemas.createTicket), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权添加票根' : '旅行不存在' });
    }
    const ticket = await Ticket.create({ travel_id: req.params.id, ...req.body });
    res.status(201).json({ success: true, message: '票根添加成功', data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:ticketId', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: '票根不存在' });
    }
    const travel = await Travel.findById(ticket.travel_id);
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该票根' });
    }
    await Ticket.delete(req.params.ticketId);
    res.json({ success: true, message: '票根删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
