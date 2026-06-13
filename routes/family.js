import express from 'express';
import { FamilyMember, User, Travel } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const familyMembers = await FamilyMember.findByUserId(req.user.id);
    const fullMembers = [];
    for (const fm of familyMembers) {
      const member = await User.findById(fm.member_user_id);
      if (member) {
        fullMembers.push({ id: fm.id, relationship: fm.relationship, member: { id: member.id, username: member.username, avatar: member.avatar, email: member.email } });
      }
    }
    res.json({ success: true, data: fullMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_email, relationship } = req.body;
    const memberUser = await User.findByEmail(member_email);
    if (!memberUser) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    if (memberUser.id === req.user.id) {
      return res.status(400).json({ success: false, message: '不能添加自己为家庭成员' });
    }
    const existing = await FamilyMember.findExisting(req.user.id, memberUser.id);
    if (existing) {
      return res.status(400).json({ success: false, message: '该用户已是家庭成员' });
    }
    const familyMember = await FamilyMember.create({ user_id: req.user.id, member_user_id: memberUser.id, relationship });
    res.status(201).json({ success: true, message: '家庭成员添加成功', data: familyMember });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const familyMember = await FamilyMember.findById(req.params.id);
    if (!familyMember) {
      return res.status(404).json({ success: false, message: '家庭成员不存在' });
    }
    if (familyMember.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该家庭成员' });
    }
    await FamilyMember.delete(req.params.id);
    res.json({ success: true, message: '家庭成员移除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/travels/:id/merge', async (req, res) => {
  try {
    const { source_travel_id } = req.body;
    const targetTravel = await Travel.findById(req.params.id);
    const sourceTravel = await Travel.findById(source_travel_id);
    if (!targetTravel || !sourceTravel) {
      return res.status(404).json({ success: false, message: '旅行不存在' });
    }
    if (targetTravel.user_id !== req.user.id || sourceTravel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权合并这些旅行' });
    }
    const { Location, TextSnippet, Photo, Restaurant, Ticket, Highlight, MoodTag, Expense, Route } = await import('../models/index.js');
    const models = [Location, TextSnippet, Photo, Restaurant, Ticket, Highlight, MoodTag, Expense, Route];
    for (const model of models) {
      const items = await model.findByTravelId(source_travel_id);
      for (const item of items) {
        await model.update(item.id, { travel_id: targetTravel.id });
      }
    }
    await Travel.delete(source_travel_id);
    res.json({ success: true, message: '旅行合并成功', data: { targetTravelId: targetTravel.id, mergedTravelId: source_travel_id } });
  } catch (error) {
    console.error('合并旅行错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
