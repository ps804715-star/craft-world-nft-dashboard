// scheduler.js - Planeamento e Automação

function planUpgrades() {
    const plan = [];
    
    TYPES.forEach(t => {
        machines.filter(m => m.type === t && m.level < DATA[t].length).forEach(m => {
            const idx = machines.indexOf(m);
            const current = DATA[t][m.level - 1];
            const next = DATA[t][m.level];
            const cost = UPG[t][m.level + 1];
            
            // Extrai o valor numérico do custo para cálculo de prioridade
            const costNum = parseFloat(cost?.split(' ')[0] || 1);
            const gain = next.ph - current.ph;
            const priority = costNum > 0 ? gain / costNum : 0;
            
            plan.push({
                index: idx,
                machine: m.name,
                type: t,
                fromLevel: m.level,
                toLevel: m.level + 1,
                cost: cost,
                gain: gain.toFixed(2),
                priority: priority.toFixed(2),
                status: 'pending'
            });
        });
    });
    
    return plan.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));
}

// Fila de tarefas (para funcionalidades futuras)
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
