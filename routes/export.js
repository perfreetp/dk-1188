import express from 'express';
import { Travel } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { generateTravelSummary } from '../utils/reportGenerator.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.post('/', async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel) {
      return res.status(404).json({ success: false, message: '旅行不存在' });
    }
    if (travel.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权导出该旅行' });
    }

    const { format = 'json', featured_only = false } = req.body;
    const summary = await generateTravelSummary(req.params.id);

    if (format === 'json') {
      const exportData = {
        basic: summary.basic,
        stats: summary.stats,
        companions: summary.companions,
        locations: summary.locations,
        highlights: featured_only ? summary.featuredHighlights : summary.highlights,
        moods: summary.moods,
        routes: summary.routes,
        expenseBreakdown: summary.expenseBreakdown,
        exportedAt: new Date().toISOString()
      };
      res.json({ success: true, data: exportData, meta: { format: 'json', travelId: travel.id, travelName: travel.name } });
    } else if (format === 'markdown') {
      const highlightsToExport = featured_only ? summary.featuredHighlights : summary.highlights;
      const markdown = generateMarkdownExport(summary, travel, highlightsToExport);
      res.json({ success: true, data: { content: markdown, type: 'markdown' }, meta: { format: 'markdown', travelId: travel.id, travelName: travel.name } });
    } else {
      res.status(400).json({ success: false, message: '不支持的导出格式' });
    }
  } catch (error) {
    console.error('导出旅行错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

function generateMarkdownExport(summary, travel, highlights) {
  const { basic, stats, companions, locations, moods, routes, expenseBreakdown } = summary;
  let md = `# ${basic.name}\n\n`;
  md += `**旅行时间**: ${basic.startDate} 至 ${basic.endDate} (${basic.duration}天)\n\n`;
  if (basic.description) md += `## 简介\n\n${basic.description}\n\n`;
  md += `## 统计概览\n\n`;
  md += `- 同行人数: ${stats.companions}\n- 打卡地点: ${stats.locations}\n- 照片数量: ${stats.photos}\n- 高光时刻: ${stats.highlights}\n- 总花费: ${stats.totalExpenses} 元\n- 总距离: ${stats.totalDistance} 公里\n\n`;
  if (companions.length > 0) {
    md += `## 同行人\n\n`;
    companions.forEach(c => md += `- ${c.name} (${c.role})\n`);
    md += '\n';
  }
  if (locations.length > 0) {
    md += `## 打卡地点\n\n`;
    locations.forEach(l => md += `- ${l.name} (${l.type})\n`);
    md += '\n';
  }
  if (highlights && highlights.length > 0) {
    md += `## 高光时刻\n\n`;
    highlights.forEach(h => {
      md += `### ${h.title}\n`;
      if (h.description) md += `${h.description}\n\n`;
    });
  }
  if (expenseBreakdown.length > 0) {
    md += `## 花费明细\n\n| 类别 | 金额 |\n|------|------|\n`;
    expenseBreakdown.forEach(e => md += `| ${e.category} | ${e.total} |\n`);
    md += '\n';
  }
  return md;
}

export default router;
