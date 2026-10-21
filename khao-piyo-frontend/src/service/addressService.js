// Saved delivery addresses, stored per signed-in user in this browser's localStorage.
// Every function is async, so when your backend is ready you only change the bodies:
//   getAddresses  -> GET    /api/addresses
//   saveAddress   -> POST   /api/addresses
//   deleteAddress -> DELETE /api/addresses/{id}
import { getStoredAuth } from '../utils/authStorage.js';

const storageKey = () => `kp-addresses:${(getStoredAuth()?.email || 'guest').toLowerCase()}`;

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey())) || [];
  } catch {
    return [];
  }
};

const write = (list) => {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(list));
  } catch {
    /* storage full or blocked, ignore */
  }
};

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Newest first
export const getAddresses = async () => read();

// Saving the same street + pincode again replaces the old entry instead of duplicating it
export const saveAddress = async (address) => {
  const saved = { ...address, id: makeId() };
  const rest = read().filter(
    (a) =>
      !(
        a.line1.trim().toLowerCase() === address.line1.trim().toLowerCase() &&
        a.pincode === address.pincode
      )
  );
  write([saved, ...rest]);
  return saved;
};

export const deleteAddress = async (id) => {
  write(read().filter((a) => a.id !== id));
};