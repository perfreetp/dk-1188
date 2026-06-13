import express from 'express';
import { Photo, Travel } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({
        success: false,
        message: travel ? '无权访问该旅行' : '旅行不存在'
      });
    }
    
    const photos = await Photo.findByTravelId(req.params.id);
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error('获取照片列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', validate(schemas.createPhoto), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel || travel.user_id !== req.user.id) {
      return res.status(travel ? 403 : 404).json({
        success: false,
        message: travel ? '无权添加照片' : '旅行不存在'
      });
    }
    
    const photo = await Photo.create({ travel_id: req.params.id, ...req.body });
    res.status(201).json({ success: true, message: '照片添加成功', data: photo });
  } catch (error) {
    console.error('添加照片错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:photoId', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: '照片不存在' });
    }
    
    const travel = await Travel.findById(photo.travel_id);
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该照片' });
    }
    
    await Photo.delete(req.params.photoId);
    res.json({ success: true, message: '照片删除成功' });
  } catch (error) {
    console.error('删除照片错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
