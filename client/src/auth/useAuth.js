import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  // If auth is null (no Firebase config), start with loading=false immediately
  const [loading, setLoading] = useState(!!auth);

  useEffect(() => {
    if (!auth) {
      // No Firebase configured — treat as logged-out guest
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
