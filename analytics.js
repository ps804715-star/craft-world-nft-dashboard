// analytics.js

// Function to calculate ROI
function calculateROI(initialInvestment, returns) {
    return ((returns - initialInvestment) / initialInvestment) * 100;
}

// Function to calculate efficiency
function calculateEfficiency(output, input) {
    return (output / input) * 100;
}

// Function to calculate payback time
function calculatePaybackTime(initialInvestment, cashFlows) {
    let cumulativeCashFlow = 0;
    let paybackTime = 0;
    for (let i = 0; i < cashFlows.length; i++) {
        cumulativeCashFlow += cashFlows[i];
        if (cumulativeCashFlow >= initialInvestment) {
            paybackTime = i + 1; // payback time in periods
            break;
        }
    }
    return paybackTime;
}

// Function to calculate profitability
function calculateProfitability(revenue, costs) {
    return revenue - costs;
}

// Example usage:
const initialInvestment = 10000;
const returns = 15000;
const roi = calculateROI(initialInvestment, returns);
const efficiency = calculateEfficiency(2000, 3000);
const paybackTime = calculatePaybackTime(initialInvestment, [3000, 4000, 3000, 5000]);
const profitability = calculateProfitability(20000, 15000);

console.log(`ROI: ${roi}%`);
console.log(`Efficiency: ${efficiency}%`);
console.log(`Payback Time: ${paybackTime} periods`);
console.log(`Profitability: $${profitability}`);