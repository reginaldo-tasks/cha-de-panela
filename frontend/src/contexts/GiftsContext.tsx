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
  uploadGiftImage: (id: string, file: File) => Promise<Gift>;
  refreshGifts: () => Promise<void>;
}

const GiftsContext = createContext<GiftsContextType | undefined>(undefined);

export function GiftsProvider({ children }: { children: ReactNode }) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { couple } = useAuth();

  const refreshGifts = async (showLoader: boolean = false) => {
    if (showLoader) {
      setIsLoading(true);
    }
    try {
      // Get token to determine if user is authenticated
      const token = localStorage.getItem('auth_token');

      let data: Gift[];
      if (token && couple?.id) {
        // If authenticated, fetch only this couple's gifts
        console.log(`[GiftsContext] Refreshing gifts for couple ${couple.id}...`);
        data = await api.gifts.getAll(couple.id);
        console.log(`[GiftsContext] ✓ Fetched ${data.length} gifts`, data.map(g => ({ id: g.id, name: g.name, status: g.status, reserved_by: g.reserved_by })));
      } else {
        // If not authenticated, fetch all public gifts
        console.log(`[GiftsContext] Refreshing all public gifts...`);
        data = await api.gifts.getAll();
        console.log(`[GiftsContext] ✓ Fetched ${data.length} public gifts`);
      }
      setGifts(data);
    } catch (error) {
      console.error('[GiftsContext] ✗ Erro ao carregar presentes:', error);
      setGifts([]);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    console.log(`[GiftsContext] useEffect triggered with couple.id:`, couple?.id);
    // Initial load: show loader
    refreshGifts(true);

    // Auto-refresh gifts every 10 seconds (without showing loader)
    console.log('[GiftsContext] Setting up auto-refresh interval (10 seconds)');
    const interval = setInterval(() => {
      console.log('[GiftsContext] ⏱️ Auto-refresh triggered');
      refreshGifts(false);
    }, 10000);

    return () => {
      console.log('[GiftsContext] Clearing auto-refresh interval');
      clearInterval(interval);
    };
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

  const uploadGiftImage = async (id: string, file: File): Promise<Gift> => {
    const updated = await api.upload.uploadGiftImage(id, file);
    setGifts(gifts.map(g => g.id === id ? updated : g));
    return updated;
  };

  return (
    <GiftsContext.Provider value={{
      gifts,
      isLoading,
      addGift,
      updateGift,
      deleteGift,
      markAsSelected,
      uploadGiftImage,
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