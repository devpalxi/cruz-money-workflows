'use client';

import React, { createContext, useContext, useState } from 'react';
import { initialWinners, initialBlacklist } from '@/lib/mockData';

const WinnersContext = createContext(null);

export function WinnersProvider({ children }) {
  const [winners, setWinners] = useState(initialWinners);
  // Shared with the winner detail page so "Add to blacklist" writes to the
  // same register the Exclusion register tab reads from - one list, not two.
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  return (
    <WinnersContext.Provider value={{ winners, setWinners, blacklist, setBlacklist }}>
      {children}
    </WinnersContext.Provider>
  );
}

export function useWinners() {
  const ctx = useContext(WinnersContext);
  if (!ctx) throw new Error('useWinners must be used within WinnersProvider');
  return ctx;
}
