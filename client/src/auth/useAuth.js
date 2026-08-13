import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getAuthHeaders } from '../utils/getAuthHeaders';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Try to fetch the user's role from the backend
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API}/api/user/profile/${firebaseUser.uid}`, {
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const profile = await res.json();
          if (mounted) {
            setUser({
              ...firebaseUser,
              role: profile.role || 'user',
            });
          }
        } else {
          // Profile doesn't exist yet — default to 'user'
          if (mounted) {
            setUser({
              ...firebaseUser,
              role: 'user',
            });
          }
        }
      } catch (err) {
        // Offline or server error — use Firebase user with default role
        if (mounted) {
          setUser({
            ...firebaseUser,
            role: 'user',
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading };
}
