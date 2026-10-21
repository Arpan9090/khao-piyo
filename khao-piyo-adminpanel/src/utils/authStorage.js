const KEY = 'kp-admin-auth';

export const getAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
};

export const saveAuth = (auth) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(auth));
  } catch {
    /* ignore */
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

// Reads the "exp" claim of the JWT (with a 10 second safety margin)
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? payload.exp * 1000 <= Date.now() + 10_000 : false;
  } catch {
    return true;
  }
};