const request = require('supertest');
const app = require('../src/app');
const { resetTodos } = require('../src/routes/todos');

// Reset todos before each test for clean state
beforeEach(() => {
  resetTodos();
});

// ─── Health Check ───────────────────────────────────────
describe('GET /health', () => {
  test('should return status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });
});

// ─── Root Route ─────────────────────────────────────────
describe('GET /', () => {
  test('should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Todo API is running!');
  });
});

// ─── GET All Todos ───────────────────────────────────────
describe('GET /api/todos', () => {
  test('should return empty array when no todos', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  test('should return todos after creation', async () => {
    await request(app).post('/api/todos').send({ title: 'Test Todo' });
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
  });
});

// ─── POST Create Todo ────────────────────────────────────
describe('POST /api/todos', () => {
  test('should create a new todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Learn DevOps' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Learn DevOps');
    expect(res.body.data.completed).toBe(false);
    expect(res.body.data).toHaveProperty('id');
  });

  test('should return 400 if title is missing', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Title is required');
  });

  test('should return 400 if title is empty string', async () => {
    const res = await request(app).post('/api/todos').send({ title: '  ' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET Single Todo ─────────────────────────────────────
describe('GET /api/todos/:id', () => {
  test('should return a single todo', async () => {
    const createRes = await request(app).post('/api/todos').send({ title: 'Find Me' });
    const id = createRes.body.data.id;
    const res = await request(app).get(`/api/todos/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  test('should return 404 for non-existent todo', async () => {
    const res = await request(app).get('/api/todos/fake-id-123');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT Update Todo ─────────────────────────────────────
describe('PUT /api/todos/:id', () => {
  test('should update a todo', async () => {
    const createRes = await request(app).post('/api/todos').send({ title: 'Old Title' });
    const id = createRes.body.data.id;
    const res = await request(app)
      .put(`/api/todos/${id}`)
      .send({ title: 'New Title', completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('New Title');
    expect(res.body.data.completed).toBe(true);
  });

  test('should return 404 for non-existent todo', async () => {
    const res = await request(app).put('/api/todos/fake-id').send({ title: 'x' });
    expect(res.statusCode).toBe(404);
  });
});

// ─── DELETE Todo ─────────────────────────────────────────
describe('DELETE /api/todos/:id', () => {
  test('should delete a todo', async () => {
    const createRes = await request(app).post('/api/todos').send({ title: 'Delete Me' });
    const id = createRes.body.data.id;
    const res = await request(app).delete(`/api/todos/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('should return 404 for non-existent todo', async () => {
    const res = await request(app).delete('/api/todos/fake-id');
    expect(res.statusCode).toBe(404);
  });
});

// ─── 404 Handler ─────────────────────────────────────────
describe('Unknown routes', () => {
  test('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});
