# 旅行记忆后端服务 - 项目规格说明

## 1. 项目概述

**项目名称**: TravelMemory API  
**项目类型**: RESTful API 后端服务  
**核心功能**: 为游记App、相册工具和家庭旅行空间提供旅行记忆管理服务  
**目标用户**: 前端应用开发者、旅行爱好者、家庭用户

## 2. 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: SQLite (使用 better-sqlite3)
- **ORM**: Sequelize
- **认证**: JWT Token
- **验证**: Joi
- **测试**: Jest

## 3. 核心功能模块

### 3.1 旅行档案管理
- 创建、更新、删除旅行档案
- 旅行基本信息：名称、时间、地点、封面图
- 旅行状态：进行中、已结束、已归档

### 3.2 时间线生成
- 按日期自动生成时间线
- 支持事件排序
- 支持时间线导出

### 3.3 同行人管理
- 添加/移除同行人
- 同行人信息：姓名、头像、角色（家人/朋友/同事）
- 多人记忆合并

### 3.4 地点关联
- 地点打卡记录
- 地点元数据：名称、坐标、类型
- 按地点检索旅行

### 3.5 内容记录
- 文字片段：标题、内容、时间戳
- 照片关联：URL、描述、拍摄时间
- 餐厅收藏：名称、地址、评分、点评
- 票根记录：类型、金额、日期、备注

### 3.6 高光时刻
- 标记高光时刻
- 高光类型：景点、美食、活动、感悟
- 高光描述和媒体关联

### 3.7 心情标签
- 预设心情标签：开心、感动、疲惫、兴奋、平静等
- 自定义心情标签
- 按心情检索

### 3.8 花费小记
- 支出记录：类别、金额、日期、支付方式
- 花费统计和分摊
- 货币支持

### 3.9 路线地图摘要
- 路线轨迹记录
- 地图摘要生成
- 距离和时长统计

### 3.10 隐私分级
- 公开：所有可见
- 私密：仅自己可见
- 密码保护：需要密码访问
- 家庭可见：家庭成员可见

### 3.11 纪念日提醒
- 设置旅行纪念日
- 提前提醒天数配置
- 提醒频率：每年/每月

### 3.12 年度报告
- 年度旅行统计
- 旅行天数、距离、花费
- 最常去的地方、最难忘的时刻
- 生成分享报告

### 3.13 精选片段导出
- 选择精彩片段
- 导出格式：PDF、图片集
- 导出质量选项

### 3.14 分享链接管理
- 生成分享链接
- 链接有效期设置
- 链接访问统计

## 4. 数据库设计

### 4.1 用户表 (users)
- id, username, email, password_hash, avatar, created_at, updated_at

### 4.2 旅行档案表 (travels)
- id, user_id, name, description, start_date, end_date, cover_image, status, privacy_level, created_at, updated_at

### 4.3 同行人表 (travel_companions)
- id, travel_id, user_id, name, avatar, role, created_at

### 4.4 地点表 (locations)
- id, travel_id, name, latitude, longitude, type, check_in_time, created_at

### 4.5 文字片段表 (text_snippets)
- id, travel_id, title, content, created_at, updated_at

### 4.6 照片表 (photos)
- id, travel_id, url, description, taken_at, created_at

### 4.7 餐厅表 (restaurants)
- id, travel_id, name, address, rating, review, created_at

### 4.8 票根表 (tickets)
- id, travel_id, type, amount, currency, date, notes, created_at

### 4.9 高光时刻表 (highlights)
- id, travel_id, title, type, description, created_at

### 4.10 心情标签表 (mood_tags)
- id, travel_id, tag_name, is_custom, created_at

### 4.11 花费记录表 (expenses)
- id, travel_id, category, amount, currency, date, payment_method, notes, created_at

### 4.12 路线表 (routes)
- id, travel_id, name, distance, duration, created_at

### 4.13 分享链接表 (share_links)
- id, travel_id, token, expires_at, access_count, created_at

### 4.14 纪念日表 (anniversaries)
- id, user_id, travel_id, name, date, reminder_days, frequency, created_at

### 4.15 家庭成员表 (family_members)
- id, user_id, member_user_id, relationship, created_at

## 5. API 接口设计

### 5.1 认证相关
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- POST /api/auth/refresh - 刷新Token

### 5.2 旅行档案
- GET /api/travels - 获取旅行列表
- POST /api/travels - 创建旅行
- GET /api/travels/:id - 获取旅行详情
- PUT /api/travels/:id - 更新旅行
- DELETE /api/travels/:id - 删除旅行
- GET /api/travels/:id/timeline - 获取时间线

### 5.3 同行人
- GET /api/travels/:id/companions - 获取同行人列表
- POST /api/travels/:id/companions - 添加同行人
- DELETE /api/travels/:id/companions/:companionId - 移除同行人

### 5.4 地点
- GET /api/travels/:id/locations - 获取地点列表
- POST /api/travels/:id/locations - 添加地点
- DELETE /api/travels/:id/locations/:locationId - 删除地点
- GET /api/locations/search - 按地点搜索旅行

### 5.5 内容记录
- GET /api/travels/:id/snippets - 获取文字片段
- POST /api/travels/:id/snippets - 添加文字片段
- PUT /api/snippets/:id - 更新文字片段
- DELETE /api/snippets/:id - 删除文字片段

### 5.6 照片
- GET /api/travels/:id/photos - 获取照片列表
- POST /api/travels/:id/photos - 添加照片
- DELETE /api/photos/:id - 删除照片

### 5.7 餐厅和票根
- GET /api/travels/:id/restaurants - 获取餐厅列表
- POST /api/travels/:id/restaurants - 添加餐厅
- GET /api/travels/:id/tickets - 获取票根列表
- POST /api/travels/:id/tickets - 添加票根

### 5.8 高光时刻
- GET /api/travels/:id/highlights - 获取高光时刻
- POST /api/travels/:id/highlights - 添加高光时刻
- PUT /api/highlights/:id - 更新高光时刻
- DELETE /api/highlights/:id - 删除高光时刻

### 5.9 心情标签
- GET /api/travels/:id/moods - 获取心情标签
- POST /api/travels/:id/moods - 添加心情标签

### 5.10 花费记录
- GET /api/travels/:id/expenses - 获取花费记录
- POST /api/travels/:id/expenses - 添加花费记录
- GET /api/travels/:id/expenses/summary - 获取花费统计

### 5.11 路线地图
- GET /api/travels/:id/routes - 获取路线列表
- POST /api/travels/:id/routes - 添加路线
- GET /api/travels/:id/routes/summary - 获取路线摘要

### 5.12 隐私和分享
- PUT /api/travels/:id/privacy - 更新隐私设置
- POST /api/travels/:id/share - 生成分享链接
- GET /api/share/:token - 访问分享内容

### 5.13 纪念日提醒
- GET /api/anniversaries - 获取纪念日列表
- POST /api/anniversaries - 添加纪念日
- PUT /api/anniversaries/:id - 更新纪念日
- DELETE /api/anniversaries/:id - 删除纪念日
- GET /api/anniversaries/upcoming - 获取即将到来的纪念日

### 5.14 年度报告
- GET /api/reports/annual/:year - 获取年度报告

### 5.15 导出
- POST /api/travels/:id/export - 导出旅行精选

### 5.16 搜索
- GET /api/search - 搜索旅行（按地点、人物、内容）

### 5.17 家庭成员
- GET /api/family - 获取家庭成员列表
- POST /api/family - 添加家庭成员
- DELETE /api/family/:id - 移除家庭成员
- POST /api/travels/:id/merge - 合并多人回忆

## 6. 验收标准

1. 所有API接口能够正常响应
2. 数据库表结构完整，关联关系正确
3. 实现所有核心功能模块
4. 通过单元测试覆盖关键业务逻辑
5. 代码结构清晰，模块化设计
6. 包含基本的错误处理和验证
7. 支持JWT认证
8. API文档完善

## 7. 项目结构

```
travel-memory-api/
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── Travel.js
│   ├── Companion.js
│   ├── Location.js
│   ├── TextSnippet.js
│   ├── Photo.js
│   ├── Restaurant.js
│   ├── Ticket.js
│   ├── Highlight.js
│   ├── MoodTag.js
│   ├── Expense.js
│   ├── Route.js
│   ├── ShareLink.js
│   ├── Anniversary.js
│   └── FamilyMember.js
├── routes/
│   ├── auth.js
│   ├── travels.js
│   ├── companions.js
│   ├── locations.js
│   ├── snippets.js
│   ├── photos.js
│   ├── restaurants.js
│   ├── tickets.js
│   ├── highlights.js
│   ├── moods.js
│   ├── expenses.js
│   ├── routes.js
│   ├── share.js
│   ├── anniversaries.js
│   ├── reports.js
│   ├── export.js
│   ├── search.js
│   └── family.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── utils/
│   ├── helpers.js
│   └── reportGenerator.js
├── tests/
│   └── *.test.js
├── app.js
├── server.js
└── package.json
```
