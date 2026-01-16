let tasks = [];
let currentFilter = 'all';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const priorityInput = document.getElementById('priority');
const tasksList = document.getElementById('tasksList');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');

// Event Listeners
taskForm.addEventListener('submit', addTask);
filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

// Functions
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Failed to load tasks');
    }
}

async function addTask(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value;

    if (!title) {
        showError('Please enter a task title');
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, priority })
        });

        if (response.ok) {
            const newTask = await response.json();
            tasks.push(newTask);
            renderTasks();
            taskForm.reset();
            priorityInput.value = 'medium';
            showSuccess('Task added successfully!');
        } else {
            showError('Failed to add task');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showError('Error adding task');
    }
}

async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !task.completed })
        });

        if (response.ok) {
            const updatedTask = await response.json();
            const taskIndex = tasks.findIndex(t => t.id === id);
            tasks[taskIndex] = updatedTask;
            renderTasks();
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Error updating task');
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
            showSuccess('Task deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Error deleting task');
    }
}

function renderTasks() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-message">No tasks found. ' + 
            (currentFilter === 'all' ? 'Add one to get started! 🚀' : 'Change filter to see more.') + '</p>';
    } else {
        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-header">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="toggleTask(${task.id})"
                    >
                    <span class="task-title">${escapeHtml(task.title)}</span>
                    <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                </div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-date">Created: ${formatDate(task.createdAt)}</div>
                <div class="task-actions">
                    <button class="btn btn-small btn-delete" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    alert('❌ ' + message);
}

function showSuccess(message) {
    console.log('✅ ' + message);
}
