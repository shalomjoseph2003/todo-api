const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory store (simple, no DB needed)
let todos = [
  { id: uuidv4(), title: 'Learn Jenkins', completed: false, createdAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Build DevOps Pipeline', completed: false, createdAt: new Date().toISOString() }
];

// GET all todos
router.get('/', (req, res) => {
  res.json({ success: true, count: todos.length, data: todos });
});

// GET single todo
router.get('/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ success: false, error: 'Todo not found' });
  }
  res.json({ success: true, data: todo });
});

// POST create todo
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }
  const newTodo = {
    id: uuidv4(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(newTodo);
  res.status(201).json({ success: true, data: newTodo });
});

// PUT update todo
router.put('/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Todo not found' });
  }
  const { title, completed } = req.body;
  todos[index] = {
    ...todos[index],
    title: title !== undefined ? title.trim() : todos[index].title,
    completed: completed !== undefined ? completed : todos[index].completed,
    updatedAt: new Date().toISOString()
  };
  res.json({ success: true, data: todos[index] });
});

// DELETE todo
router.delete('/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Todo not found' });
  }
  todos.splice(index, 1);
  res.json({ success: true, message: 'Todo deleted' });
});

// Export for testing
module.exports = router;
module.exports.resetTodos = () => { todos = []; };
