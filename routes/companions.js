import express from 'express';
import { Companion, Travel } from '../models/index.js';
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
    
    const companions = await Companion.findByTravelId(req.params.id);
    
    res.json({
      success: true,
      data: companions
    });
  } catch (error) {
    console.error('获取同行人列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.post('/', validate(schemas.createCompanion), async (req, res) => {
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
        message: '无权添加同行人'
      });
    }
    
    const companion = await Companion.create({
      travel_id: req.params.id,
      ...req.body
    });
    
    res.status(201).json({
      success: true,
      message: '同行人添加成功',
      data: companion
    });
  } catch (error) {
    console.error('添加同行人错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.delete('/:companionId', async (req, res) => {
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
        message: '无权移除同行人'
      });
    }
    
    const companion = await Companion.findById(req.params.companionId);
    
    if (!companion) {
      return res.status(404).json({
        success: false,
        message: '同行人不存在'
      });
    }
    
    if (companion.travel_id !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: '同行人不属于该旅行'
      });
    }
    
    await Companion.delete(req.params.companionId);
    
    res.json({
      success: true,
      message: '同行人移除成功'
    });
  } catch (error) {
    console.error('移除同行人错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;
