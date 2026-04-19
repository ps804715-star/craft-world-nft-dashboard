// analytics.js - Analytics e Métricas

function calculateROI(initialInvestment, returns) {
    if (initialInvestment === 0) return 0;
    return ((returns - initialInvestment) / initialInvestment) * 100;
}

function calculateEfficiency(output, input) {
    if (input === 0) return 0;
    return (output / input) * 100;
}

function calculatePaybackTime(initialInvestment, cashFlows) {
    let cumulativeCashFlow = 0;
    for (let i = 0; i < cashFlows.length; i++) {
        cumulativeCashFlow += cashFlows[i];
        if (cumulativeCashFlow >= initialInvestment) {
            return i + 1;
        }
    }
    return -1; // Não atingiu o payback
}

function calculateProfitability(revenue, costs) {
    return revenue - costs;
}

// Métricas específicas para o Craft World
function getMachineEfficiency(type, level) {
    const data = DATA[type][level - 1];
    if (!data) return 0;
    return calculateEfficiency(data.out, data.inp);
}

function getTotalProductionValue() {
    return TYPES.reduce((sum, t) => sum + phTotal(t), 0);
}
