const AUTH_KEY = "goias_pvc_users";
const CURRENT_USER_KEY = "goias_pvc_current_user";
const AUTH_VERSION = 2;
const PBKDF2_ITERATIONS = 120000;
const PBKDF2_HASH = "SHA-256";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getUsers() {
    const users = localStorage.getItem(AUTH_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

function hasValidCredential(user) {
    return Boolean(
        (typeof user.passwordHash === "string" && user.passwordHash.length > 0 && typeof user.salt === "string" && user.salt.length > 0) ||
        (typeof user.password === "string" && user.password.length > 0)
    );
}

function toB64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}

function fromB64(b64) {
    return Uint8Array.from(atob(b64), char => char.charCodeAt(0));
}

function sanitizeUser(user) {
    const { password, passwordHash, salt, ...safe } = user;
    return safe;
}

async function hashPassword(password, saltBytes) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: PBKDF2_ITERATIONS,
            hash: PBKDF2_HASH
        },
        keyMaterial,
        256
    );
    return toB64(new Uint8Array(bits));
}

async function setPasswordRecord(user, plainPassword) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    user.salt = toB64(salt);
    user.passwordHash = await hashPassword(plainPassword, salt);
    delete user.password;
}

async function verifyPassword(user, plainPassword) {
    if (user.passwordHash && user.salt) {
        const computed = await hashPassword(plainPassword, fromB64(user.salt));
        return computed === user.passwordHash;
    }
    if (typeof user.password === "string") {
        return user.password === plainPassword;
    }
    return false;
}

function setCurrentUser(user) {
    const payload = {
        ...sanitizeUser(user),
        sessionExpiresAt: Date.now() + SESSION_TTL_MS
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(payload));
}

function getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;

    const user = JSON.parse(raw);
    if (!user.sessionExpiresAt || Date.now() > user.sessionExpiresAt) {
        logout();
        return null;
    }

    return user;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

async function initDefaultUser() {
    const users = getUsers();
    if (users.length > 0) {
        let changed = false;

        for (let i = 0; i < users.length; i += 1) {
            if (!hasValidCredential(users[i])) {
                await setPasswordRecord(users[i], "admin123");
                users[i].authVersion = AUTH_VERSION;
                changed = true;
            }
        }

        if (!users.some(u => (u.username || "").toLowerCase() === "henrique")) {
            const defaultUser = {
                id: Date.now().toString(),
                name: "Administrador",
                username: "henrique",
                phone: "",
                createdAt: new Date().toISOString(),
                authVersion: AUTH_VERSION
            };
            await setPasswordRecord(defaultUser, "admin123");
            users.push(defaultUser);
            changed = true;
        }

        if (changed) saveUsers(users);
        return;
    }

    const defaultUser = {
        id: "1",
        name: "Administrador",
        username: "henrique",
        phone: "",
        createdAt: new Date().toISOString(),
        authVersion: AUTH_VERSION
    };
    await setPasswordRecord(defaultUser, "admin123");
    users.push(defaultUser);
    saveUsers(users);
}

async function register(name, username, password, phone = "") {
    await initPromise;
    const users = getUsers();
    const normalizedUsername = username.trim().toLowerCase();

    if (users.find(u => u.username === normalizedUsername)) {
        return { success: false, message: "Usuário já existe" };
    }

    const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        username: normalizedUsername,
        phone: phone.trim(),
        createdAt: new Date().toISOString(),
        authVersion: AUTH_VERSION
    };

    await setPasswordRecord(newUser, password);
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    return { success: true, user: sanitizeUser(newUser) };
}

async function login(username, password) {
    await initPromise;
    const users = getUsers();
    const normalizedUsername = username.trim().toLowerCase();
    const userIndex = users.findIndex(
        u => (u.username || "").trim().toLowerCase() === normalizedUsername
    );

    if (userIndex === -1) {
        return { success: false, message: "Usuário ou senha incorretos" };
    }

    const user = users[userIndex];
    const valid = await verifyPassword(user, password);
    if (!valid) {
        return { success: false, message: "Usuário ou senha incorretos" };
    }

    // Migra automaticamente registros antigos (senha em texto puro).
    if (!user.passwordHash || !user.salt || user.authVersion !== AUTH_VERSION) {
        user.authVersion = AUTH_VERSION;
        await setPasswordRecord(user, password);
        users[userIndex] = user;
        saveUsers(users);
    }

    setCurrentUser(user);
    return { success: true, user: sanitizeUser(user) };
}

function updateProfile(name, phone) {
    const users = getUsers();
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: "Usuário não autenticado" };

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: "Usuário não encontrado" };

    users[userIndex].name = name.trim();
    users[userIndex].phone = phone.trim();
    saveUsers(users);
    setCurrentUser(users[userIndex]);

    return { success: true, user: sanitizeUser(users[userIndex]) };
}

async function changePassword(currentPassword, newPassword) {
    await initPromise;
    const users = getUsers();
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: "Usuário não autenticado" };

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: "Usuário não encontrado" };

    const validCurrent = await verifyPassword(users[userIndex], currentPassword);
    if (!validCurrent) return { success: false, message: "Senha atual incorreta" };

    users[userIndex].authVersion = AUTH_VERSION;
    await setPasswordRecord(users[userIndex], newPassword);
    saveUsers(users);
    setCurrentUser(users[userIndex]);

    return { success: true };
}

const initPromise = initDefaultUser();

window.Auth = {
    register,
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    updateProfile,
    changePassword
};