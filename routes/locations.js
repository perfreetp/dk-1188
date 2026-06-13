import express from 'express';
import { Location, Travel } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    
    if (!travel) {
      return res.status(404).json({
        success: false,
        message: '旅行不存在'
      });
    }
    
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权访问该旅行'
      });
    }
    
    const locations = await Location.findByTravelId(req.params.id);
    
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('获取地点列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.post('/', validate(schemas.createLocation), async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    
    if (!travel) {
      return res.status(404).json({
        success: false,
        message: '旅行不存在'
      });
    }
    
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权添加地点'
      });
    }
    
    const location = await Location.create({
      travel_id: req.params.id,
      ...req.body
    });
    
    res.status(201).json({
      success: true,
      message: '地点添加成功',
      data: location
    });
  } catch (error) {
    console.error('添加地点错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.delete('/:locationId', async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    
    if (!travel) {
      return res.status(404).json({
        success: false,
        message: '旅行不存在'
      });
    }
    
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权删除地点'
      });
    }
    
    const location = await Location.findById(req.params.locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: '地点不存在'
      });
    }
    
    if (location.travel_id !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: '地点不属于该旅行'
      });
    }
    
    await Location.delete(req.params.locationId);
    
    res.json({
      success: true,
      message: '地点删除成功'
    });
  } catch (error) {
    console.error('删除地点错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;
