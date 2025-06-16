import { useState, useEffect, useCallback } from 'react';
import { Container, Slot, Schedule } from '@/types/dispenser';
import { getDispensers, createDispenser, updateDispenserSlot } from '@/api/dispensers';

export const useDispensers = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadContainers = useCallback(async () => {
    try {
      setError(null);
      const data = await getDispensers();
      setContainers(data);
    } catch (err: any) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
        setLoading(true);
        await loadContainers();
        setLoading(false);
    }
    load();
  }, [loadContainers]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadContainers();
    setIsRefreshing(false);
  }, [loadContainers]);

  const addContainer = async (name: string, serialId: string) => {
    try {
      const newDispenser = await createDispenser(name, serialId);
      setContainers(prev => [...prev, newDispenser]);
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const updateSlot = async (dispenserId: number, slot: Slot, pillName: string, schedules: Schedule[]) => {
    try {
      const updatedSlot = await updateDispenserSlot(dispenserId, slot.id, pillName, schedules);
      
      setContainers(prevContainers => {
        return prevContainers.map(container => {
          if (container.id === dispenserId) {
            const newSlots = container.containers.map(s => 
              s.id === updatedSlot.id ? updatedSlot : s
            );
            return { ...container, containers: newSlots };
          }
          return container;
        });
      });

    } catch (err: any) {
        setError(err);
        throw err;
    }
  };

  const retryFetch = () => {
    setLoading(true);
    loadContainers().finally(() => setLoading(false));
  };


  return { containers, loading, error, retryFetch, isRefreshing, onRefresh, addContainer, updateSlot };
}; 