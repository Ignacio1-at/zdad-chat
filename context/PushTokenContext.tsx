// context/PushTokenContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface PushTokenContextValue {
  expoPushToken: string;
  setExpoPushToken: (token: string) => void;
}

const PushTokenContext = createContext<PushTokenContextValue>({
  expoPushToken: '',
  setExpoPushToken: () => {},
});

export function PushTokenProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState('');

  return (
    <PushTokenContext.Provider value={{ expoPushToken, setExpoPushToken }}>
      {children}
    </PushTokenContext.Provider>
  );
}

export function usePushToken() {
  return useContext(PushTokenContext);
}
