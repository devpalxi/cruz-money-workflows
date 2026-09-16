'use client';

import React, { createContext, useContext, useState } from 'react';
import { initialWinners } from '@/lib/mockData';

const WinnersContext = createContext(null);

export function WinnersProvider({ children }) {
  const [winners, setWinners] = useState(initialWinners);
  return (
    <WinnersContext.Provider value={{ winners, setWinners }}>
      {children}
    </WinnersContext.Provider>
  );
}

export function useWinners() {
  const ctx = useContext(WinnersContext);
  if (!ctx) throw new Error('useWinners must be used within WinnersProvider');
  return ctx;
}
