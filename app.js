import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import travelsRoutes from './routes/travels.js';
import companionsRoutes from './routes/companions.js';
import locationsRoutes from './routes/locations.js';
import snippetsRoutes from './routes/snippets.js';
import photosRoutes from './routes/photos.js';
import restaurantsRoutes from './routes/restaurants.js';
import ticketsRoutes from './routes/tickets.js';
import highlightsRoutes from './routes/highlights.js';
import moodsRoutes from './routes/moods.js';
import expensesRoutes from './routes/expenses.js';
import routesRoutes from './routes/routes.js';
import shareRoutes from './routes/share.js';
import anniversariesRoutes from './routes/anniversaries.js';
import reportsRoutes from './routes/reports.js';
import exportRoutes from './routes/export.js';
import searchRoutes from './routes/search.js';
import familyRoutes from './routes/family.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Travel Memory API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/travels', travelsRoutes);
app.use('/api/travels/:id/companions', companionsRoutes);
app.use('/api/travels/:id/locations', locationsRoutes);
app.use('/api/travels/:id/snippets', snippetsRoutes);
app.use('/api/travels/:id/photos', photosRoutes);
app.use('/api/travels/:id/restaurants', restaurantsRoutes);
app.use('/api/travels/:id/tickets', ticketsRoutes);
app.use('/api/travels/:id/highlights', highlightsRoutes);
app.use('/api/travels/:id/moods', moodsRoutes);
app.use('/api/travels/:id/expenses', expensesRoutes);
app.use('/api/travels/:id/routes', routesRoutes);
app.use('/api/travels/:id/export', exportRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/anniversaries', anniversariesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/family', familyRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

export default app;
