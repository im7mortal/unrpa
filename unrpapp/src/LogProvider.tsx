import React, { useReducer, createContext, Dispatch } from 'react';

type LogAction = {
  type: 'ADD_LOG';
  payload: string;
};

type LogContextProps = {
  logs: string[];
  recordLog: (msg: string) => void;
};
interface LogProviderProps {
  children: React.ReactNode;
}
const LogContext = createContext<LogContextProps | undefined>(undefined);

const logReducer = (state: string[], action: LogAction) => {
  switch (action.type) {
    case 'ADD_LOG':
      return [...state, action.payload];
    default:
      return state;
  }
};

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logs, dispatch] = useReducer(logReducer, []);

  const recordLog = (message: string) => {
    dispatch({ type: 'ADD_LOG', payload: message });
  };

  return (
      <LogContext.Provider value={{ logs, recordLog }}>
        {children}
      </LogContext.Provider>
  );
};

export const useLogs = () => {
  const context = React.useContext(LogContext);
  if (!context) {
    throw new Error("useLogs must be used within a LogProvider");
  }
  return context;
};