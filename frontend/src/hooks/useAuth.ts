// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccessToken() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/api/refresh_token`,
          {},
          { withCredentials: true }
        );

        if (res.data.success && res.data.accessToken) {
          setAccessToken(res.data.accessToken);
        } else {
          setAccessToken(null);
        }
      } catch  {
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAccessToken();
  }, []);

  return { accessToken, loading };
}
