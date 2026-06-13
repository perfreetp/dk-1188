import request from 'supertest';
import app from '../app.js';

describe('API Tests', () => {
  describe('Health Check', () => {
    test('GET /api/health should return success', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Travel Memory API');
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('接口不存在');
    });
  });

  describe('Auth Routes', () => {
    test('POST /api/auth/register should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('数据验证失败');
    });

    test('POST /api/auth/login should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('Travels Routes', () => {
    test('GET /api/travels should require authentication', async () => {
      const response = await request(app)
        .get('/api/travels')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('未提供认证令牌');
    });
  });
});
