# 旅行记忆后端服务 API

基于 Node.js + Express + SQLite 的旅行记忆管理后端服务

## 功能特性

### 核心功能
- ✅ 创建旅行档案
- ✅ 按日期生成时间线
- ✅ 记录同行人
- ✅ 关联地点
- ✅ 保存文字片段
- ✅ 收藏餐厅和票根
- ✅ 标记高光时刻
- ✅ 补充心情标签
- ✅ 维护花费小记
- ✅ 生成路线地图摘要
- ✅ 合并多人回忆
- ✅ 按地点或人物检索旧旅程

### 辅助功能
- ✅ 隐私分级（公开/私密/密码保护/家庭可见）
- ✅ 纪念日提醒
- ✅ 旅行年度报告
- ✅ 精选片段导出
- ✅ 分享链接管理

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
npm start
```

服务运行在 http://localhost:3001

### 开发模式
```bash
npm run dev
```

### 运行测试
```bash
npm test
```

## API 接口

### 健康检查
```
GET /api/health
```

### 认证
```
POST /api/auth/register - 用户注册
POST /api/auth/login - 用户登录
POST /api/auth/refresh - 刷新Token
```

### 旅行档案
```
GET /api/travels - 获取旅行列表
POST /api/travels - 创建旅行
GET /api/travels/:id - 获取旅行详情
PUT /api/travels/:id - 更新旅行
DELETE /api/travels/:id - 删除旅行
GET /api/travels/:id/timeline - 获取时间线
PUT /api/travels/:id/privacy - 更新隐私设置
```

### 同行人
```
GET /api/travels/:id/companions
POST /api/travels/:id/companions
DELETE /api/travels/:id/companions/:companionId
```

### 地点
```
GET /api/travels/:id/locations
POST /api/travels/:id/locations
DELETE /api/travels/:id/locations/:locationId
```

### 文字片段
```
GET /api/travels/:id/snippets
POST /api/travels/:id/snippets
PUT /api/snippets/:snippetId
DELETE /api/snippets/:snippetId
```

### 照片
```
GET /api/travels/:id/photos
POST /api/travels/:id/photos
DELETE /api/photos/:photoId
```

### 餐厅
```
GET /api/travels/:id/restaurants
POST /api/travels/:id/restaurants
DELETE /api/restaurants/:restaurantId
```

### 票根
```
GET /api/travels/:id/tickets
POST /api/travels/:id/tickets
DELETE /api/tickets/:ticketId
```

### 高光时刻
```
GET /api/travels/:id/highlights
POST /api/travels/:id/highlights
PUT /api/highlights/:highlightId
DELETE /api/highlights/:highlightId
```

### 心情标签
```
GET /api/travels/:id/moods
POST /api/travels/:id/moods
GET /api/travels/:id/moods/presets
DELETE /api/moods/:moodId
```

### 花费记录
```
GET /api/travels/:id/expenses
POST /api/travels/:id/expenses
GET /api/travels/:id/expenses/summary
DELETE /api/expenses/:expenseId
```

### 路线
```
GET /api/travels/:id/routes
POST /api/travels/:id/routes
GET /api/travels/:id/routes/summary
DELETE /api/routes/:routeId
```

### 分享
```
POST /api/share/travels/:id/share - 生成分享链接
GET /api/share/:token - 访问分享内容
DELETE /api/share/travels/:id/share - 删除分享链接
```

### 纪念日
```
GET /api/anniversaries
POST /api/anniversaries
PUT /api/anniversaries/:id
DELETE /api/anniversaries/:id
GET /api/anniversaries/upcoming
```

### 年度报告
```
GET /api/reports/annual/:year
```

### 导出
```
POST /api/travels/:id/export
```

### 搜索
```
GET /api/search
```

### 家庭成员
```
GET /api/family
POST /api/family
DELETE /api/family/:id
POST /api/family/travels/:id/merge
```

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: SQLite (sql.js)
- **认证**: JWT Token
- **验证**: Joi
- **测试**: Jest
