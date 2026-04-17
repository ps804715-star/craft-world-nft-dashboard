// scheduler.js - Task Scheduling & Automation

/**
 * Planejamento otimizado de upgrades
 */
function planUpgrades(budget = null) {
  const plan = [];
  
  TYPES.forEach(t => {
    machines.filter(m => m.type === t && m.level < DATA[t].length).forEach(m => {
      const idx = machines.indexOf(m);
      const current = DATA[t][m.level - 1];
      const next = DATA[t][m.level];
      const cost = UPG[t][m.level + 1];
      
      const gain = (next.ph - current.ph).toFixed(2);
      const priority = parseFloat(gain) / parseFloat(cost?.split(' ')[0] || 1);
      
      plan.push({
        index: idx,
        machine: m.name,
        type: t,
        fromLevel: m.level,
        toLevel: m.level + 1,
        cost: cost,
        gain: gain,
        priority: priority.toFixed(2),
        status: 'pending'
      });
    });
  });
  
  return plan.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));
}

/**
 * Fila de tarefas
 */
let taskQueue = [];

function addToQueue(task) {
  taskQueue.push({
    id: taskQueue.length,
    task: task,
    timestamp: new Date(),
    completed: false
  });
  return task;
}

function getQueue() {
  return taskQueue.filter(t => !t.completed);
}

function completeTask(id) {
  const task = taskQueue.find(t => t.id === id);
  if (task) task.completed = true;
}

/**
 * Timeline de eventos
 */
const timeline = [];

function addEvent(eventName, daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  timeline.push({
    date: date,
    event: eventName,
    daysUntil: daysFromNow
  });
  return timeline.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Alertas da fila
 */
function checkQueueAlerts() {
  const alerts = [];
  
  if (taskQueue.length > 10) {
    alerts.push('⚠️ Fila contém ' + taskQueue.length + ' tarefas');
  }
  
  const overdueTasks = taskQueue.filter(t => !t.completed && 
    (new Date() - t.timestamp) > 7 * 24 * 60 * 60 * 1000);
  
  if (overdueTasks.length > 0) {
    alerts.push('⚠️ ' + overdueTasks.length + ' tarefas atrasadas');
  }
  
  return alerts;
}