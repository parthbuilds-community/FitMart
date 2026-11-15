import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Admin access is a Firebase custom claim (`admin: true`), granted by the
 * server bootstrap script. There is no local UID list and no env override.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await u.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin === true);
      } catch {
        setIsAdmin(false);
      }

      setLoading(false);
    });
  }, []);

  return { user, isAdmin, loading };
}
