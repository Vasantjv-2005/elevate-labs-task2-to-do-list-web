class TodoApp {
  constructor() {
      this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      this.taskIdCounter = parseInt(localStorage.getItem('taskIdCounter')) || 1;
      
      this.taskInput = document.getElementById('taskInput');
      this.addBtn = document.getElementById('addBtn');
      this.taskList = document.getElementById('taskList');
      this.emptyState = document.getElementById('emptyState');
      this.totalTasks = document.getElementById('totalTasks');
      this.completedTasks = document.getElementById('completedTasks');
      this.pendingTasks = document.getElementById('pendingTasks');
      
      this.init();
  }
  
  init() {
      this.addEventListeners();
      this.renderTasks();
      this.updateStats();
  }
  
  addEventListeners() {
      // Add button click
      this.addBtn.addEventListener('click', () => this.addTask());
      
      // Enter key press
      this.taskInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              this.addTask();
          }
      });
      
      // Input validation
      this.taskInput.addEventListener('input', () => {
          this.validateInput();
      });
  }
  
  validateInput() {
      const value = this.taskInput.value.trim();
      if (value.length > 0) {
          this.addBtn.style.opacity = '1';
          this.addBtn.style.pointerEvents = 'auto';
      } else {
          this.addBtn.style.opacity = '0.6';
          this.addBtn.style.pointerEvents = 'none';
      }
  }
  
  addTask() {
      const taskText = this.taskInput.value.trim();
      
      if (taskText === '') {
          this.showNotification('Please enter a task!', 'error');
          return;
      }
      
      if (taskText.length > 100) {
          this.showNotification('Task is too long! Maximum 100 characters.', 'error');
          return;
      }
      
      const newTask = {
          id: this.taskIdCounter++,
          text: taskText,
          completed: false,
          createdAt: new Date().toISOString()
      };
      
      this.tasks.unshift(newTask);
      this.saveToLocalStorage();
      this.renderTasks();
      this.updateStats();
      
      // Clear input and add success animation
      this.taskInput.value = '';
      this.validateInput();
      this.showNotification('Task added successfully!', 'success');
      
      // Add button animation
      this.addBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
          this.addBtn.style.transform = 'scale(1)';
      }, 150);
  }
  
  toggleTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
          task.completed = !task.completed;
          this.saveToLocalStorage();
          this.renderTasks();
          this.updateStats();
          
          const message = task.completed ? 'Task completed!' : 'Task marked as pending!';
          this.showNotification(message, 'info');
      }
  }
  
  deleteTask(taskId) {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex > -1) {
          const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
          
          // Add delete animation
          taskElement.style.transform = 'translateX(100%)';
          taskElement.style.opacity = '0';
          
          setTimeout(() => {
              this.tasks.splice(taskIndex, 1);
              this.saveToLocalStorage();
              this.renderTasks();
              this.updateStats();
              this.showNotification('Task deleted!', 'info');
          }, 300);
      }
  }
  
  renderTasks() {
      this.taskList.innerHTML = '';
      
      if (this.tasks.length === 0) {
          this.emptyState.classList.add('show');
          return;
      }
      
      this.emptyState.classList.remove('show');
      
      this.tasks.forEach(task => {
          const taskElement = this.createTaskElement(task);
          this.taskList.appendChild(taskElement);
      });
  }
  
  createTaskElement(task) {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.setAttribute('data-task-id', task.id);
      
      li.innerHTML = `
          <div class="task-content">
              <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                   onclick="todoApp.toggleTask(${task.id})"></div>
              <span class="task-text">${this.escapeHtml(task.text)}</span>
          </div>
          <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})" 
                  title="Delete task">×</button>
      `;
      
      return li;
  }
  
  updateStats() {
      const total = this.tasks.length;
      const completed = this.tasks.filter(task => task.completed).length;
      const pending = total - completed;
      
      this.totalTasks.textContent = `Total: ${total}`;
      this.completedTasks.textContent = `Completed: ${completed}`;
      this.pendingTasks.textContent = `Pending: ${pending}`;
  }
  
  saveToLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
      localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
  }
  
  escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
  }
  
  showNotification(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      // Style the notification
      Object.assign(notification.style, {
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 20px',
          borderRadius: '10px',
          color: 'white',
          fontWeight: '600',
          zIndex: '1000',
          transform: 'translateX(100%)',
          transition: 'transform 0.3s ease',
          maxWidth: '300px',
          wordWrap: 'break-word'
      });
      
      // Set background color based on type
      const colors = {
          success: 'linear-gradient(45deg, #4caf50, #45a049)',
          error: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
          info: 'linear-gradient(45deg, #667eea, #764ba2)'
      };
      notification.style.background = colors[type] || colors.info;
      
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => {
          notification.style.transform = 'translateX(0)';
      }, 100);
      
      // Animate out and remove
      setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
              document.body.removeChild(notification);
          }, 300);
      }, 3000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.todoApp = new TodoApp();
});

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to add task
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      document.getElementById('taskInput').focus();
  }
  
  // Escape to clear input
  if (e.key === 'Escape') {
      document.getElementById('taskInput').value = '';
      document.getElementById('taskInput').blur();
  }
});