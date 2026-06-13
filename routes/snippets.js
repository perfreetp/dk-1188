import express from 'express';
import { TextSnippet, Travel } from '../models/index.js';
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
    
    const snippets = await TextSnippet.findByTravelId(req.params.id);
    
    res.json({
      success: true,
      data: snippets
    });
  } catch (error) {
    console.error('获取文字片段列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.post('/', validate(schemas.createSnippet), async (req, res) => {
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
        message: '无权添加文字片段'
      });
    }
    
    const snippet = await TextSnippet.create({
      travel_id: req.params.id,
      ...req.body
    });
    
    res.status(201).json({
      success: true,
      message: '文字片段添加成功',
      data: snippet
    });
  } catch (error) {
    console.error('添加文字片段错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.put('/:snippetId', async (req, res) => {
  try {
    const snippet = await TextSnippet.findById(req.params.snippetId);
    
    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: '文字片段不存在'
      });
    }
    
    const travel = await Travel.findById(snippet.travel_id);
    
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权修改该文字片段'
      });
    }
    
    const updatedSnippet = await TextSnippet.update(req.params.snippetId, req.body);
    
    res.json({
      success: true,
      message: '文字片段更新成功',
      data: updatedSnippet
    });
  } catch (error) {
    console.error('更新文字片段错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.delete('/:snippetId', async (req, res) => {
  try {
    const snippet = await TextSnippet.findById(req.params.snippetId);
    
    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: '文字片段不存在'
      });
    }
    
    const travel = await Travel.findById(snippet.travel_id);
    
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权删除该文字片段'
      });
    }
    
    await TextSnippet.delete(req.params.snippetId);
    
    res.json({
      success: true,
      message: '文字片段删除成功'
    });
  } catch (error) {
    console.error('删除文字片段错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;
