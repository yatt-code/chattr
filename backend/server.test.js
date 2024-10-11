const request = require('supertest');
const app = require('./server'); // You might need to modify server.js to export the app

describe('API Endpoints', () => {
  it('should respond to /api/chat', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('type');
    expect(res.body).toHaveProperty('content');
  });

  // Add more tests...
});