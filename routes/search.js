import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateQuery, schemas } from '../middleware/validation.js';
import { Location, TextSnippet, Photo, Companion, Travel } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

router.get('/', validateQuery(schemas.search), async (req, res) => {
  try {
    const { query: searchQuery, type = 'all' } = req.query;
    const results = { travels: [], locations: [], companions: [], content: [] };

    if (type === 'all' || type === 'location') {
      const locations = await Location.searchByName(searchQuery);
      const filteredLocations = [];
      for (const loc of locations) {
        const travel = await Travel.findById(loc.travel_id);
        if (travel && travel.user_id === req.user.id) {
          filteredLocations.push({ 
            id: loc.id, 
            name: loc.name, 
            type: loc.type, 
            travelId: loc.travel_id, 
            travelName: travel.name, 
            checkInTime: loc.check_in_time 
          });
        }
      }
      results.locations = filteredLocations;
    }

    if (type === 'all' || type === 'companion') {
      const allCompanions = await Companion.findByTravelId('');
      const filteredCompanions = [];
      for (const comp of allCompanions || []) {
        if (comp.name.includes(searchQuery)) {
          const travel = await Travel.findById(comp.travel_id);
          if (travel && travel.user_id === req.user.id) {
            filteredCompanions.push({ 
              id: comp.id, 
              name: comp.name, 
              role: comp.role, 
              travelId: comp.travel_id, 
              travelName: travel.name 
            });
          }
        }
      }
      results.companions = filteredCompanions;
    }

    if (type === 'all' || type === 'content') {
      const snippets = await TextSnippet.search(searchQuery);
      const photos = await Photo.search(searchQuery);
      const filteredSnippets = [];
      for (const s of snippets) {
        const travel = await Travel.findById(s.travel_id);
        if (travel && travel.user_id === req.user.id) {
          filteredSnippets.push({ 
            type: 'snippet', 
            id: s.id, 
            title: s.title, 
            content: s.content?.substring(0, 100), 
            travelId: s.travel_id, 
            travelName: travel.name, 
            date: s.date 
          });
        }
      }
      const filteredPhotos = [];
      for (const p of photos) {
        const travel = await Travel.findById(p.travel_id);
        if (travel && travel.user_id === req.user.id) {
          filteredPhotos.push({ 
            type: 'photo', 
            id: p.id, 
            url: p.url, 
            description: p.description, 
            travelId: p.travel_id, 
            travelName: travel.name, 
            takenAt: p.taken_at 
          });
        }
      }
      results.content = [...filteredSnippets, ...filteredPhotos];
    }

    const totalCount = results.travels.length + results.locations.length + results.companions.length + results.content.length;
    res.json({ success: true, data: results, meta: { query: searchQuery, type, totalCount } });
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
