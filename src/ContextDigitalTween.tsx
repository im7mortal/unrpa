import React, { createContext, useReducer, Dispatch } from 'react';
import { DigitalTwin } from './DigitalTwin';

type Action =
    | { type: 'ADD', payload: DigitalTwin }
    | { type: 'REMOVE', payload: string };

const initialState: DigitalTwin[] = [];

const DigitalTwinContext = createContext<{
    digitalTwins: DigitalTwin[],
    dispatch: Dispatch<Action>,
}>({
    digitalTwins: initialState,
    dispatch: () => null,
});

const digitalTwinReducer = (state: DigitalTwin[], action: Action) => {
    switch (action.type) {
        case 'ADD':
            return [...state, action.payload];
        case 'REMOVE':
            return state.filter((twin) => twin.dtHdId !== action.payload);
        default:
            return state;
    }
};

const DigitalTwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(digitalTwinReducer, initialState);

    return (
        <DigitalTwinContext.Provider value={{ digitalTwins: state, dispatch }}>
            {children}
        </DigitalTwinContext.Provider>
    );
};

export { DigitalTwinContext, DigitalTwinProvider };
