const AUTH_KEY = 'kp-auth';
const NAMES_KEY = 'kp-names';

export const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
};

export const saveAuth = (auth) => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {
    /* ignore */
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
};

// The login API only returns email + token, so the name typed at sign-up is remembered per email
const readNames = () => {
  try {
    return JSON.parse(localStorage.getItem(NAMES_KEY)) || {};
  } catch {
    return {};
  }
};

export const saveName = (email, name) => {
  try {
    localStorage.setItem(NAMES_KEY, JSON.stringify({ ...readNames(), [email.toLowerCase()]: name }));
  } catch {
    /* ignore */
  }
};

export const getSavedName = (email) => readNames()[email.toLowerCase()] || '';

// Reads the "exp" claim of the JWT (with a 10 second safety margin)
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? payload.exp * 1000 <= Date.now() + 10_000 : false;
  } catch {
    return true;
  }
};