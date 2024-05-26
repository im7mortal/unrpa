import React, { useReducer, createContext, Dispatch } from 'react';
import { logLevelFunction, Logger, LogLevel } from './logInterface';

type LogAction = {
  type: 'ADD_LOG';
  payload: string;
};


type LogContextProps = {
  logs: string[];
  recordLog: logLevelFunction;
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

interface LogProviderProps {
  children: React.ReactNode,
  loggers: Logger[]
}

// Declare logProvider function as of type (message: string) => void
export const DefaultLoggerFunc: (message: string) => void = function logProvider(message: string) {
  console.log("THIS FUNCTIONS MUST NOT BE CALLED")
};

export const LogProvider: React.FC<LogProviderProps> = ({ children, loggers }) => {
  const [logs, dispatch] = useReducer(logReducer, []);
  console.log("GET HERE GOOD")
  // Iterate over loggers and replace logFunction of the one that matches fromThisPackage
  for(let i = 0; i < loggers.length; i++) {
    if(loggers[i].logFunction === DefaultLoggerFunc) {
      loggers[i].logFunction = (message: string) => {
        console.log("GET IN GOOD")
        dispatch({ type: 'ADD_LOG', payload: message });
      };
    }
  }

  const recordLog = (message: string, logLevel: LogLevel) => {
    loggers.filter(logger => logger.logLevel >= logLevel)
        .forEach(logger => logger.logFunction(message));
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