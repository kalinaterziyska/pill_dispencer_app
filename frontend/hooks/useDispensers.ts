import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container } from '../types/dispenser';
import { API_BASE_URL } from '@/constants/api';

export function useDispensers() {
  const { token } = useAuth();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const api = useMemo(() => {
    if (token) {
      return new DispenserAPI(token);
    }
    return null;
  }, [token]);

  const fetchContainers = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const data = await api.fetchContainers();
      setContainers(data);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  const addContainer = useCallback(async (name: string, serialId: string) => {
    if (!api) {
      throw new Error("API client not initialized");
    }
    const newContainer = await api.addContainer(name, serialId);
    setContainers(prev => [...prev, newContainer]);
  }, [api]);

  const deleteContainer = useCallback(async (containerId: number) => {
    if (!api) {
      throw new Error("API client not initialized");
    }
    const containerToDelete = containers.find(c => c.id === containerId);
    if (!containerToDelete) {
      throw new Error("Container not found");
    }

    await api.deleteContainer(containerToDelete.name);
    setContainers(prev => prev.filter(c => c.id !== containerId));
  }, [api, containers]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchContainers().finally(() => setIsRefreshing(false));
  }, [fetchContainers]);

  const retryFetch = useCallback(() => {
    setError(null);
    fetchContainers();
  }, [fetchContainers]);

  return { containers, loading, error, isRefreshing, onRefresh, addContainer, deleteContainer, retryFetch };
}

class DispenserAPI {
  constructor(private token: string) {}

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };
  }

  async fetchContainers(): Promise<Container[]> {
    const res = await fetch(`${API_BASE_URL}/api/list-all-user-dispensers/`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
    return await res.json();
  }

  async addContainer(name: string, serialId: string): Promise<Container> {
    const body = JSON.stringify({ name, serial_id: serialId });
    const res = await fetch(`${API_BASE_URL}/api/register-dispenser/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body,
    });
    if (!res.ok) {
      const errorData = await res.json();
      const detail = errorData.detail || errorData.name?.[0] || errorData.serial_id?.[0] || 'An unknown error occurred.';
      throw new Error(detail);
    }
    return await res.json();
  }

  async deleteContainer(containerName: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/delete-dispenser/${containerName}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Failed to delete dispenser' }));
      throw new Error(errorData.detail);
    }
  }
} 