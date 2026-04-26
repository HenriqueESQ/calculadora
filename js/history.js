const HISTORY_KEY = "goias_pvc_calc_history_v1";
const HISTORY_LIMIT = 30;

function readJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (_) {
        return fallback;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getHistoryByType(type) {
    const all = readJson(HISTORY_KEY, {});
    return Array.isArray(all[type]) ? all[type] : [];
}

function saveCalculation(type, payload) {
    const all = readJson(HISTORY_KEY, {});
    const current = Array.isArray(all[type]) ? all[type] : [];

    const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        createdAt: new Date().toISOString(),
        ...payload
    };

    current.unshift(entry);
    all[type] = current.slice(0, HISTORY_LIMIT);
    writeJson(HISTORY_KEY, all);
    return entry;
}

function clearHistoryByType(type) {
    const all = readJson(HISTORY_KEY, {});
    all[type] = [];
    writeJson(HISTORY_KEY, all);
}

window.CalcHistory = {
    getHistoryByType,
    saveCalculation,
    clearHistoryByType
};
