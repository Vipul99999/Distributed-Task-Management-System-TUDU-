// frontend/src/hooks/useLabels.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/types/task";
import { labelApi } from "@/lib/api/labelApi";


export const useLabels = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Fetch all labels
  const fetchLabels = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await labelApi.get<Label[]>("/");
      setLabels(res.data);
    } catch (err) {
      console.error("Failed to fetch labels:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new label
  const createLabel = async (name: string, color?: string) => {
    try {
      const res = await labelApi.post<Label>("/", { name, color });
      setLabels((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Failed to create label:", err);
      throw err;
    }
  };

  // Update label
  const updateLabel = async (id: string, updates: Partial<Label>) => {
    try {
      const res = await labelApi.put<Label>(`/${id}`, updates);
      setLabels((prev) => prev.map((l) => (l.id === id ? res.data : l)));
      return res.data;
    } catch (err) {
      console.error("Failed to update label:", err);
      throw err;
    }
  };

  // Delete label
  const deleteLabel = async (id: string) => {
    try {
      await labelApi.delete(`/${id}`);
      setLabels((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Failed to delete label:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  return {
    labels,
    isLoading,
    isError,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
  };
};

