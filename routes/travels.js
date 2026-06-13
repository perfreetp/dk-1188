import express from 'express';
import {
  Travel,
  Companion,
  Location,
  TextSnippet,
  Photo,
  Restaurant,
  Ticket,
  Highlight,
  MoodTag,
  Expense,
  Route
} from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { groupByDate, sortByDate, calculateDuration } from '../utils/helpers.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const travels = await Travel.findByUserId(req.user.id, {
      status,
      limit: parseInt(limit),
      offset
    });
    
    const total = await Travel.countByUserId(req.user.id);
    
    const enrichedTravels = await Promise.all(
      travels.map(async (t) => {
        const companions = await Companion.findByTravelId(t.id);
        const locations = await Location.findByTravelId(t.id);
        const photos = await Photo.findByTravelId(t.id);
        
        return {
          id: t.id,
          name: t.name,
          description: t.description,
          startDate: t.start_date,
          endDate: t.end_date,
          duration: calculateDuration(t.start_date, t.end_date || t.start_date),
          coverImage: t.cover_image,
          status: t.status,
          privacyLevel: t.privacy_level,
          previewPhoto: photos.length > 0 ? photos[0].url : null,
          companionsCount: companions.length,
          locationsCount: locations.length,
          createdAt: t.created_at
        };
      })
    );
    
    res.json({
      success: true,
      data: enrichedTravels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取旅行列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.post('/', validate(schemas.createTravel), async (req, res) => {
  try {
    const travel = await Travel.create({
      user_id: req.user.id,
      ...req.body
    });
    
    res.status(201).json({
      success: true,
      message: '旅行创建成功',
      data: travel
    });
  } catch (error) {
    console.error('创建旅行错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.get('/:id', async (req, res) => {
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
    
    const [companions, locations, snippets, photos, restaurants, tickets, highlights, moods, expenses, routes] = await Promise.all([
      Companion.findByTravelId(req.params.id),
      Location.findByTravelId(req.params.id),
      TextSnippet.findByTravelId(req.params.id),
      Photo.findByTravelId(req.params.id),
      Restaurant.findByTravelId(req.params.id),
      Ticket.findByTravelId(req.params.id),
      Highlight.findByTravelId(req.params.id),
      MoodTag.findByTravelId(req.params.id),
      Expense.findByTravelId(req.params.id),
      Route.findByTravelId(req.params.id)
    ]);
    
    res.json({
      success: true,
      data: {
        ...travel,
        companions,
        locations,
        snippets,
        photos,
        restaurants,
        tickets,
        highlights,
        moods,
        expenses,
        routes,
        duration: calculateDuration(travel.start_date, travel.end_date || travel.start_date)
      }
    });
  } catch (error) {
    console.error('获取旅行详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.put('/:id', validate(schemas.updateTravel), async (req, res) => {
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
        message: '无权修改该旅行'
      });
    }
    
    const updatedTravel = await Travel.update(req.params.id, req.body);
    
    res.json({
      success: true,
      message: '旅行更新成功',
      data: updatedTravel
    });
  } catch (error) {
    console.error('更新旅行错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.delete('/:id', async (req, res) => {
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
        message: '无权删除该旅行'
      });
    }
    
    await Travel.delete(req.params.id);
    
    res.json({
      success: true,
      message: '旅行删除成功'
    });
  } catch (error) {
    console.error('删除旅行错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.get('/:id/timeline', async (req, res) => {
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
    
    const [companions, locations, snippets, photos, highlights, moods, expenses, routes] = await Promise.all([
      Companion.findByTravelId(req.params.id),
      Location.findByTravelId(req.params.id),
      TextSnippet.findByTravelId(req.params.id),
      Photo.findByTravelId(req.params.id),
      Highlight.findByTravelId(req.params.id),
      MoodTag.findByTravelId(req.params.id),
      Expense.findByTravelId(req.params.id),
      Route.findByTravelId(req.params.id)
    ]);
    
    const timelineItems = [
      ...snippets.map(s => ({
        type: 'snippet',
        date: s.date || s.created_at,
        data: s
      })),
      ...locations.map(l => ({
        type: 'location',
        date: l.check_in_time || l.created_at,
        data: l
      })),
      ...photos.map(p => ({
        type: 'photo',
        date: p.taken_at || p.created_at,
        data: p
      })),
      ...highlights.map(h => ({
        type: 'highlight',
        date: h.date || h.created_at,
        data: h
      })),
      ...moods.map(m => ({
        type: 'mood',
        date: m.date || m.created_at,
        data: m
      })),
      ...expenses.map(e => ({
        type: 'expense',
        date: e.date || e.created_at,
        data: e
      })),
      ...routes.map(r => ({
        type: 'route',
        date: r.created_at,
        data: r
      }))
    ];
    
    const sortedItems = sortByDate(timelineItems, 'date', 'ASC');
    const groupedTimeline = groupByDate(sortedItems, 'date');
    
    res.json({
      success: true,
      data: {
        travelName: travel.name,
        startDate: travel.start_date,
        endDate: travel.end_date,
        timeline: groupedTimeline
      }
    });
  } catch (error) {
    console.error('获取时间线错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.put('/:id/privacy', async (req, res) => {
  try {
    const { privacy_level, password } = req.body;
    
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
        message: '无权修改该旅行'
      });
    }
    
    await Travel.update(req.params.id, {
      privacy_level,
      password: privacy_level === 'password_protected' ? password : null
    });
    
    res.json({
      success: true,
      message: '隐私设置更新成功',
      data: {
        privacy_level
      }
    });
  } catch (error) {
    console.error('更新隐私设置错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;
