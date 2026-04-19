// app.js - Lógica Principal da Aplicação

let machines = [];
let _activeTab = 'visao';
let _filterType = null;

// Inicialização
try { 
    machines = JSON.parse(localStorage.getItem('cwn_machines') || '[]'); 
} catch(e) { 
    machines = []; 
}

function save() { 
    try { 
        localStorage.setItem('cwn_machines', JSON.stringify(machines)); 
    } catch(e) {
        showToast('❌ Erro ao guardar dados');
    } 
}

// Funções de Cálculo (usando dados do config.js)
function phTotal(type) { 
    return machines.filter(m => m.type === type).reduce((s,m) => { 
        const d = DATA[type][m.level - 1]; 
        return s + (d ? d.ph : 0); 
    }, 0); 
}

function inputNeeded(type) { 
    return machines.filter(m => m.type === type).reduce((s,m) => { 
        const d = DATA[type][m.level - 1]; 
        return s + (d ? d.ph * (d.inp / d.out) : 0); 
    }, 0); 
}

// UI: Modais
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// UI: Tabs
function switchTab(t, el) {
    _activeTab = t;
    _filterType = null;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('on'));
    document.querySelectorAll('.tab').forEach(s => s.classList.remove('on'));
    document.getElementById('sec-' + t).classList.add('on');
    el.classList.add('on');
    render();
}

// Render: Cadeia de Produção
function renderChain() {
    document.getElementById('chain-row').innerHTML = CHAIN.map((m, i) => {
        const c = COLORS[m] || {bg:'#F1EFE8', tc:'#444441'};
        const ph = m === 'EARTH' ? '—' : fmtN(phTotal(m));
        return (i > 0 ? '<span class="arrow-ch">→</span>' : '') +
            `<div class="cnode" style="background:${c.bg};color:${c.tc}" onclick="filterMachines('${m}')">${m}<br><span style="font-size:10px;font-weight:400">${ph}/h</span></div>`;
    }).join('');
}

// Render: Visão Geral
function renderVisao() {
    const totalM = machines.length;
    const tipos = TYPES.filter(t => machines.some(m => m.type === t)).length;
    const totalPh = TYPES.reduce((s,t) => s + phTotal(t), 0);
    const maxLv = machines.reduce((mx,m) => Math.max(mx, m.level), 0);

    let html = `<div class="g4" style="margin-bottom:14px">
        <div class="metric"><div class="mlabel">Máquinas</div><div class="mval">${totalM}</div></div>
        <div class="metric"><div class="mlabel">Tipos ativos</div><div class="mval">${tipos}/6</div></div>
        <div class="metric"><div class="mlabel">Prod. total/h</div><div class="mval" style="color:var(--green)">${fmtN(totalPh,1)}</div></div>
        <div class="metric"><div class="mlabel">Nível máx.</div><div class="mval">${maxLv || '—'}</div></div>
    </div>`;

    html += `<div class="sec-title">Produção por tipo</div>`;
    const maxPh = Math.max(...TYPES.map(t => phTotal(t)), 1);
    TYPES.forEach(t => {
        const ph = phTotal(t); const c = COLORS[t];
        const inp = inputNeeded(t);
        const inpMat = t === 'MUD' ? 'EARTH' : TYPES[TYPES.indexOf(t) - 1];
        const count = machines.filter(m => m.type === t).length;
        const efficiency = count > 0 ? getMachineEfficiency(t, machines.find(m => m.type === t).level) : 0;
        
        html += `<div class="machine-row">
            <div style="width:72px;font-size:13px;font-weight:500;padding:2px 7px;border-radius:6px;background:${c.bg};color:${c.tc}">${t}</div>
            <div style="width:28px;font-size:12px;color:var(--text2);text-align:center">${count}x</div>
            <div class="bar-wrap"><div class="bar-fill" style="width:${ph>0?Math.round(ph/maxPh*100):0}%;background:${c.tc}"></div></div>
            <div style="width:90px;text-align:right;font-size:13px;font-weight:500">${fmtN(ph,1)}/h</div>
            <div style="width:130px;text-align:right;font-size:11px;color:var(--text2)">usa ${fmtN(inp,1)} ${inpMat}/h</div>
        </div>`;
    });

    html += `<div class="sec-title" style="margin-top:16px">Balanço da cadeia</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:10px">`;
    TYPES.forEach((t, i) => {
        if (i === 0) return;
        const prod = phTotal(TYPES[i-1]);
        const need = inputNeeded(t);
        const diff = prod - need;
        const ok = need === 0 || diff >= 0;
        const c = COLORS[t];
        html += `<div class="card" style="padding:.75rem">
            <div style="font-size:11px;padding:2px 7px;border-radius:5px;background:${c.bg};color:${c.tc};display:inline-block;margin-bottom:6px">${TYPES[i-1]} → ${t}</div>
            <div style="font-size:13px;color:var(--text2)">Produz: <strong style="color:var(--text)">${fmtN(prod,1)}/h</strong></div>
            <div style="font-size:13px;color:var(--text2)">Precisa: <strong style="color:var(--text)">${fmtN(need,1)}/h</strong></div>
            <div style="margin-top:6px;font-size:13px;font-weight:500;color:${ok?'var(--green)':'var(--red)'}">
                ${need === 0 ? '—' : ok ? '+'+fmtN(diff,1)+' excesso' : fmtN(Math.abs(diff),1)+' em falta'}
            </div>
        </div>`;
    });
    html += `</div>`;

    document.getElementById('sec-visao').innerHTML = html;
}

// Render: Máquinas
function filterMachines(t) { 
    _filterType = t; 
    _activeTab = 'maquinas'; 
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('on')); 
    document.getElementById('sec-maquinas').classList.add('on'); 
    document.querySelectorAll('.tab').forEach((el,i)=>{el.classList.remove('on');if(i===1)el.classList.add('on');}); 
    renderMaquinas(); 
}

function renderMaquinas() {
    let list = _filterType ? machines.filter(m => m.type === _filterType) : machines;
    let html = '';
    if (_filterType) html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="muted">A mostrar: ${_filterType}</span><button class="btn" style="font-size:12px" onclick="_filterType=null;renderMaquinas()">Ver todas</button></div>`;
    if (list.length === 0) { html += '<div class="muted">Nenhuma máquina. Clica em "+ Máquina" para adicionar.</div>'; document.getElementById('sec-maquinas').innerHTML = html; return; }
    TYPES.forEach(t => {
        const ms = list.filter(m => m.type === t);
        if (!ms.length) return;
        const c = COLORS[t];
        html += `<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:500;padding:3px 10px;border-radius:6px;background:${c.bg};color:${c.tc};display:inline-block;margin-bottom:8px">${t}</div>`;
        ms.forEach(m => {
            const idx = machines.indexOf(m);
            const d = DATA[t][m.level - 1];
            const maxLvl = DATA[t].length;
            const nextCost = UPG[t] && UPG[t][m.level + 1];
            const inpMat = t === 'MUD' ? 'EARTH' : TYPES[TYPES.indexOf(t) - 1];
            html += `<div class="card" style="margin-bottom:8px;padding:.75rem 1rem">
                <div class="row-between" style="margin-bottom:6px">
                <div style="font-weight:500">${m.name}<span class="edit-icon" onclick="editMachine(${idx})">editar</span></div>
                <div style="display:flex;gap:6px;align-items:center">
                    <span class="pill" style="background:${c.bg};color:${c.tc}">Nv ${m.level}</span>
                    ${m.level < maxLvl ? `<span class="pill" style="background:var(--amber-bg);color:var(--amber)">→ ${nextCost||'?'}</span>` : `<span class="pill" style="background:var(--green-bg);color:var(--green)">máx</span>`}
                </div>
                </div>
                <div style="display:flex;gap:16px;font-size:12px;color:var(--text2);flex-wrap:wrap">
                <span>Output: <strong style="color:var(--text)">${fmtN(d?d.out:0)} ${t}/ciclo</strong></span>
                <span>Taxa: <strong style="color:var(--text)">${fmtN(d?d.ph:0,1)}/h</strong></span>
                <span>Input: <strong style="color:var(--text)">${fmtN(d?d.inp:0)} ${inpMat}/ciclo</strong></span>
                </div>
                <button class="btn btn-danger" style="margin-top:8px;font-size:12px" onclick="removeMachine(${idx})">Remover</button>
            </div>`;
        });
        html += `</div>`;
    });
    document.getElementById('sec-maquinas').innerHTML = html;
}

// Render: Upgrades
function renderUpgrades() {
    let html = ''; let any = false;
    TYPES.forEach(t => {
        const ms = machines.filter(m => m.type === t && m.level < DATA[t].length);
        if (!ms.length) return;
        any = true;
        const c = COLORS[t];
        html += `<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:500;padding:3px 10px;border-radius:6px;background:${c.bg};color:${c.tc};display:inline-block;margin-bottom:8px">${t}</div>`;
        ms.forEach(m => {
            const idx = machines.indexOf(m);
            const cur = DATA[t][m.level - 1]; const nxt = DATA[t][m.level];
            const cost = UPG[t] && UPG[t][m.level + 1];
            const gain = (nxt.ph - cur.ph).toFixed(2);
            html += `<div class="card" style="margin-bottom:8px;padding:.75rem 1rem">
                <div class="row-between" style="margin-bottom:6px">
                <div style="font-weight:500">${m.name}</div>
                <span class="pill" style="background:var(--amber-bg);color:var(--amber)">Nv ${m.level} → ${m.level+1}</span>
                </div>
                <div style="display:flex;gap:16px;font-size:12px;color:var(--text2);margin-bottom:8px;flex-wrap:wrap">
                <span>Custo: <strong style="color:var(--text)">${cost||'—'}</strong></span>
                <span>Ganho/h: <strong style="color:var(--green)">+${gain} ${t}</strong></span>
                <span>${fmtN(cur.ph,2)} → <strong style="color:var(--text)">${fmtN(nxt.ph,2)}/h</strong></span>
                </div>
                <button class="btn btn-primary" style="font-size:12px" onclick="doUpgrade(${idx})">Confirmar upgrade</button>
            </div>`;
        });
        html += `</div>`;
    });
    if (!any) html = '<div class="muted">Sem upgrades disponíveis, ou sem máquinas registadas.</div>';
    document.getElementById('sec-upgrades').innerHTML = html;
}

// Render: Planeamento (NOVO)
function renderPlaneamento() {
    const plan = planUpgrades();
    if (plan.length === 0) {
        document.getElementById('sec-planeamento').innerHTML = '<div class="muted">Sem upgrades recomendados no momento.</div>';
        return;
    }
    
    let html = '<div class="sec-title">Melhores Upgrades (Custo-Benefício)</div>';
    html += '<div class="muted" style="margin-bottom:10px">Ordenado por maior ganho de produção por unidade de recurso gasto</div>';
    
    plan.slice(0, 10).forEach(p => {
        const c = COLORS[p.type];
        html += `<div class="card" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center">
            <div>
                <div style="font-weight:500; display:flex; align-items:center; gap:8px">
                    <span class="pill" style="background:${c.bg};color:${c.tc}">${p.type}</span>
                    ${p.machine} (Nv ${p.fromLevel}→${p.toLevel})
                </div>
                <div class="muted" style="font-size:12px">Custo: ${p.cost} | Ganho: +${p.gain}/h | Prioridade: ${p.priority}</div>
            </div>
            <button class="btn btn-primary" style="font-size:12px" onclick="doUpgrade(${p.index})">Aplicar</button>
        </div>`;
    });
    document.getElementById('sec-planeamento').innerHTML = html;
}

// Render Principal
function render() {
    renderChain();
    if (_activeTab === 'visao') renderVisao();
    if (_activeTab === 'maquinas') renderMaquinas();
    if (_activeTab === 'upgrades') renderUpgrades();
    if (_activeTab === 'planeamento') renderPlaneamento();
}

// Funções de Gestão de Máquinas
function refreshNmLevels() {
    const t = document.getElementById('nm-type').value;
    document.getElementById('nm-level').innerHTML = DATA[t].map((_,i) => `<option value="${i+1}">Nível ${i+1}</option>`).join('');
}

function addMachine() {
    const t = document.getElementById('nm-type').value;
    const l = parseInt(document.getElementById('nm-level').value);
    const n = document.getElementById('nm-name').value.trim() || t + ' #' + (machines.filter(m=>m.type===t).length + 1);
    
    const newMachine = {type:t, level:l, name:n};
    if (!validateMachine(newMachine)) {
        showToast('❌ Dados inválidos');
        return;
    }
    
    machines.push(newMachine);
    save(); 
    closeModal('modal-addmachine');
    document.getElementById('nm-name').value = '';
    showToast('✅ Máquina adicionada');
    render();
}

function removeMachine(idx) { 
    if(confirm('Tem a certeza que deseja remover esta máquina?')) {
        machines.splice(idx, 1); 
        save(); 
        showToast('🗑️ Máquina removida');
        render(); 
    }
}

function editMachine(idx) {
    const m = machines[idx];
    document.getElementById('em-idx').value = idx;
    document.getElementById('em-name').value = m.name;
    document.getElementById('em-level').innerHTML = DATA[m.type].map((_,i) => `<option value="${i+1}" ${i+1===m.level?'selected':''}>Nível ${i+1}</option>`).join('');
    openModal('modal-editmachine');
}

function saveMachine() {
    const idx = parseInt(document.getElementById('em-idx').value);
    machines[idx].name = document.getElementById('em-name').value.trim() || machines[idx].name;
    machines[idx].level = parseInt(document.getElementById('em-level').value);
    save(); 
    closeModal('modal-editmachine'); 
    showToast('✅ Máquina atualizada');
    render();
}

function doUpgrade(idx) {
    const m = machines[idx];
    if (m.level < DATA[m.type].length) { 
        machines[idx].level++; 
        save(); 
        showToast('⬆️ Upgrade realizado!');
        render(); 
    }
}

// Inicializar
refreshNmLevels();
render();
