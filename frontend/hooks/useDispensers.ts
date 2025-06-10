import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Slot, Schedule } from '../types/dispenser';

export function useDispensers() {
  const { token } = useAuth();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadContainers() {
    setError(null);
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
  
      const res = await fetch('http://localhost:8000/api/list-all-user-dispensers/', { headers });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data: Container[] = await res.json();
      setContainers(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
        loadContainers();
    }
  }, [token]);

  const addContainer = async (name: string, serialId: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const body = JSON.stringify({ name, serial_id: serialId });
    const res = await fetch('http://localhost:8000/api/register-dispenser/', {
      method: 'POST',
      headers,
      body,
    });
    if (!res.ok) {
      const errorData = await res.json();
      const detail = errorData.detail || errorData.name?.[0] || errorData.serial_id?.[0] || 'An unknown error occurred.';
      throw new Error(detail);
    }
    await loadContainers(); // Refresh the list
  };

  const updateSlot = async (dispenserName: string, slot: Slot, pillName: string, schedules: Schedule[]) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    
    const body = JSON.stringify({
      dispenser_name: dispenserName,
      slot_number: slot.slot_number,
      pill_name: pillName,
      schedules: schedules.map(({ time, weekday }) => ({ time, weekday })),
    });

    const res = await fetch('http://localhost:8000/api/container-schedule/', {
      method: 'PUT',
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to update slot.');
    }
    await loadContainers(); // Refresh data
  };

  return { containers, loading, error, loadContainers, addContainer, updateSlot, setError };
} 