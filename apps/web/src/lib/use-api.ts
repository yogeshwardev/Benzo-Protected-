"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(path));

  const reload = useCallback(async () => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setData(await apiRequest<T>(path));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
}
