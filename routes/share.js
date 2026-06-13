import express from 'express';
import bcrypt from 'bcryptjs';
import { ShareLink, Travel, FamilyMember } from '../models/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/travels/:id/share', authenticate, validate(schemas.createShareLink), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel) {
      return res.status(404).json({ success: false, message: '旅行不存在' });
    }
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权分享该旅行' });
    }

    let expiresAt = null;
    if (req.body.expires_in_days) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + req.body.expires_in_days);
    }

    const existingLink = await ShareLink.findByTravelId(req.params.id);
    if (existingLink) {
      await ShareLink.deactivate(req.params.id);
    }

    const shareLink = await ShareLink.create({ travel_id: req.params.id, expires_at: expiresAt });
    res.status(201).json({ success: true, message: '分享链接创建成功', data: { token: shareLink.token, url: `/api/share/${shareLink.token}`, expiresAt: shareLink.expires_at } });
  } catch (error) {
    console.error('创建分享链接错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/:token', optionalAuth, async (req, res) => {
  try {
    const shareLink = await ShareLink.findByToken(req.params.token);
    if (!shareLink) {
      return res.status(404).json({ success: false, message: '分享链接不存在或已失效' });
    }
    if (shareLink.expires_at && new Date() > new Date(shareLink.expires_at)) {
      return res.status(410).json({ success: false, message: '分享链接已过期' });
    }

    const travel = await Travel.findById(shareLink.travel_id);
    if (!travel) {
      return res.status(404).json({ success: false, message: '旅行不存在' });
    }

    const isOwner = req.user && req.user.id === travel.user_id;
    let isFamilyMember = false;
    
    if (!isOwner && req.user) {
      const familyMembers = await FamilyMember.findByUserId(travel.user_id);
      isFamilyMember = familyMembers.some(fm => fm.member_user_id === req.user.id);
    }

    if (travel.privacy_level === 'private') {
      if (!isOwner) {
        return res.status(403).json({ success: false, message: '该旅行未公开' });
      }
    }

    if (travel.privacy_level === 'family') {
      if (!isOwner && !isFamilyMember) {
        return res.status(403).json({ success: false, message: '该旅行仅家庭可见' });
      }
    }

    if (travel.privacy_level === 'password_protected') {
      if (isOwner || isFamilyMember) {
        await ShareLink.incrementAccessCount(shareLink.id);
        res.json({ success: true, data: { travel: { id: travel.id, name: travel.name, description: travel.description, startDate: travel.start_date, endDate: travel.end_date, coverImage: travel.cover_image }, accessCount: shareLink.access_count + 1 } });
        return;
      }
      
      if (!req.query.password) {
        return res.status(401).json({ success: false, message: '需要密码访问', requirePassword: true });
      }
      
      const isMatch = await bcrypt.compare(req.query.password, travel.password || '');
      if (!isMatch) {
        return res.status(401).json({ success: false, message: '密码错误' });
      }
    }

    await ShareLink.incrementAccessCount(shareLink.id);
    res.json({ success: true, data: { travel: { id: travel.id, name: travel.name, description: travel.description, startDate: travel.start_date, endDate: travel.end_date, coverImage: travel.cover_image }, accessCount: shareLink.access_count + 1 } });
  } catch (error) {
    console.error('访问分享内容错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/travels/:id/share', authenticate, async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({ success: false, message: travel ? '无权操作' : '旅行不存在' });
    }
    await ShareLink.deactivate(req.params.id);
    res.json({ success: true, message: '分享链接已失效' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
