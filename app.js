const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data file path
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Initialize tasks file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper functions
const readTasks = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeTasks = (tasks) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const tasks = readTasks();
  const newTask = {
    id: Date.now(),
    title: title.trim(),
    description: description || '',
    priority: priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

app.get('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === parseInt(req.params.id));

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, priority, completed } = req.body;
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title !== undefined ? title : tasks[taskIndex].title,
    description: description !== undefined ? description : tasks[taskIndex].description,
    priority: priority !== undefined ? priority : tasks[taskIndex].priority,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed
  };

  writeTasks(tasks);
  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deletedTask = tasks.splice(taskIndex, 1);
  writeTasks(tasks);
  res.json({ message: 'Task deleted', task: deletedTask[0] });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`========================================\n`);
  console.log(`Open your browser and go to: http://<PUBLIC_IP>:${PORT}\n`);
});
