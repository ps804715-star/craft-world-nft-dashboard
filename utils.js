// utils.js - Utility Functions

// Validation function for machines
function validateMachine(machine) {
    if (!machine.type || !machine.level || !machine.name) {
        return false;
    }
    return true;
}

// Function to export data as JSON
function exportToJSON(data) {
    const dataStr = JSON.stringify(data);
    return dataStr;
}

// Function to import data from JSON
function importFromJSON(jsonStr) {
    try {
        const data = JSON.parse(jsonStr);
        return data;
    } catch (e) {
        console.error('Invalid JSON');
        return null;
    }
}

// Function to calculate efficiency
function calculateEfficiency(output, input) {
    if (input === 0) return 0;
    return (output / input) * 100;
}

// Function for unit conversion
function convertUnits(value, fromUnit, toUnit) {
    const conversionTable = {
        'hour_to_day': 24,
        'day_to_hour': 1 / 24,
        'hour_to_month': 720,
        'month_to_hour': 1 / 720
    };
    
    const key = `${fromUnit}_to_${toUnit}`;
    return value * (conversionTable[key] || 1);
}

// Simple cache for storing calculations
const cache = {};

function cacheSet(key, value, ttl = 3600) {
    cache[key] = {
        value: value,
        timestamp: Date.now(),
        ttl: ttl
    };
}

function cacheGet(key) {
    if (!cache[key]) return null;
    
    const now = Date.now();
    const age = (now - cache[key].timestamp) / 1000;
    
    if (age > cache[key].ttl) {
        delete cache[key];
        return null;
    }
    
    return cache[key].value;
}