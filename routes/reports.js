import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { generateAnnualReport } from '../utils/reportGenerator.js';

const router = express.Router();
router.use(authenticate);

router.get('/annual/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const yearNum = parseInt(year);
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ success: false, message: '无效的年份' });
    }
    
    const report = await generateAnnualReport(req.user.id, yearNum);
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('生成年度报告错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
