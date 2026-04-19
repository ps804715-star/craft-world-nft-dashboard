// utils.js - Funções Utilitárias

function fmtN(n, dec=0) { 
    return Number(n).toLocaleString('pt-PT', {minimumFractionDigits:dec, maximumFractionDigits:dec}); 
}

function validateMachine(machine) {
    if (!machine.type || !machine.level || !machine.name) return false;
    if (!TYPES.includes(machine.type)) return false;
    if (machine.level < 1 || machine.level > DATA[machine.type].length) return false;
    return true;
}

// Exportar dados como download de arquivo
function exportData(data, filename = 'craft-world-backup.json') {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Importar dados via input de arquivo
function importDataFromFile(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            try {
                const content = readerEvent.target.result;
                const data = JSON.parse(content);
                if (Array.isArray(data)) {
                    callback(data);
                    showToast('✅ Dados restaurados com sucesso!');
                } else {
                    showToast('❌ Formato de arquivo inválido');
                }
            } catch (e) {
                showToast('❌ Erro ao ler arquivo JSON');
                console.error(e);
            }
        };
    }
    input.click();
}

// Sistema de Cache simples
const cache = {};
function cacheSet(key, value, ttl = 3600) {
    cache[key] = { value, timestamp: Date.now(), ttl };
}
function cacheGet(key) {
    if (!cache[key]) return null;
    const age = (Date.now() - cache[key].timestamp) / 1000;
    if (age > cache[key].ttl) { delete cache[key]; return null; }
    return cache[key].value;
}

// Notificações Toast
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; 
        background: var(--bg); border: 1px solid var(--border2);
        padding: 12px 20px; border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000; animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
