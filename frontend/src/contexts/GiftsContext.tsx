import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Gift, CreateGiftInput, UpdateGiftInput } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface GiftsContextType {
  gifts: Gift[];
  isLoading: boolean;
  addGift: (data: CreateGiftInput) => Promise<Gift>;
  updateGift: (id: string, data: UpdateGiftInput) => Promise<Gift>;
  deleteGift: (id: string) => Promise<void>;
  markAsSelected: (id: string) => Promise<void>;
  refreshGifts: () => Promise<void>;
}

const GiftsContext = createContext<GiftsContextType | undefined>(undefined);

export function GiftsProvider({ children }: { children: ReactNode }) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { couple } = useAuth();

  const refreshGifts = async () => {
    setIsLoading(true);
    try {
      // Get token to determine if user is authenticated
      const token = localStorage.getItem('auth_token');

      let data: Gift[];
      if (token && couple?.id) {
        // If authenticated, fetch only this couple's gifts
        data = await api.gifts.getAll(couple.id);
      } else {
        // If not authenticated, fetch all public gifts
        data = await api.gifts.getAll();
      }
      setGifts(data);
    } catch (error) {
      console.error('Erro ao carregar presentes:', error);
      setGifts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshGifts();

    // Auto-refresh gifts every 10 seconds
    const interval = setInterval(() => {
      refreshGifts();
    }, 10000);

    return () => clearInterval(interval);
  }, [couple?.id]);

  const saveGifts = (newGifts: Gift[]) => {
    setGifts(newGifts);
  };

  const addGift = async (data: CreateGiftInput): Promise<Gift> => {
    const newGift = await api.gifts.create(data);
    setGifts([...gifts, newGift]);
    return newGift;
  };

  const updateGift = async (id: string, data: UpdateGiftInput): Promise<Gift> => {
    const updated = await api.gifts.update(id, data);
    setGifts(gifts.map(g => g.id === id ? updated : g));
    return updated;
  };

  const deleteGift = async (id: string): Promise<void> => {
    await api.gifts.delete(id);
    setGifts(gifts.filter(g => g.id !== id));
  };

  const markAsSelected = async (id: string): Promise<void> => {
    await api.gifts.markAsSelected(id);
    setGifts(gifts.map(g =>
      g.id === id
        ? { ...g, isSelected: true, selectedAt: new Date().toISOString() }
        : g
    ));
  };

  return (
    <GiftsContext.Provider value={{
      gifts,
      isLoading,
      addGift,
      updateGift,
      deleteGift,
      markAsSelected,
      refreshGifts
    }}>
      {children}
    </GiftsContext.Provider>
  );
}

export function useGifts() {
  const context = useContext(GiftsContext);
  if (context === undefined) {
    throw new Error('useGifts must be used within a GiftsProvider');
  }
  return context;
}