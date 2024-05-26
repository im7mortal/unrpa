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
export const DefaultExternalLoggerFunc: (message: string) => void = function logProvider(message: string) {
  console.log("THIS FUNCTIONS MUST NOT BE CALLED")
};

export const LogProvider: React.FC<LogProviderProps> = ({ children, loggers }) => {
  const [logs, dispatch] = useReducer(logReducer, []);

  const recordLog = (message: string, logLevel: LogLevel): void => {
    for (let i = 0; i < loggers.length; i++) {
      // check if logLevel is adequate
      if (loggers[i].logLevel >= logLevel) {
        // decide if it internal or external function
        if (loggers[i].logFunction === DefaultExternalLoggerFunc) {
          loggers[i].logFunction = (message: string) => {
            dispatch({type: 'ADD_LOG', payload: message});
          };
        } else {
          loggers[i].logFunction(message)
        }
      }
    }
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