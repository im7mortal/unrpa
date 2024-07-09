import React, {createContext, useReducer, Dispatch} from 'react';
import {FileExtraction} from './detectVersion';

type Action =
    | { type: 'ADD', payload: FileExtraction }
    | { type: 'REMOVE', payload: string };

const initialState: FileExtraction[] = [];

const FilesContext = createContext<{
    files: FileExtraction[],
    dispatch: Dispatch<Action>,
}>({
    files: initialState,
    dispatch: () => null
});

const fileReducer = (state: FileExtraction[], action: Action) => {
    switch (action.type) {
        case 'ADD':
            return [...state, action.payload];
        case 'REMOVE':
            return state.filter((file) => file.Id !== action.payload);
        default:
            return state;
    }
};

const FilesProvider: React.FC<{ children: React.JSX.Element | React.JSX.Element[] }> = ({children}) => {
    const [state, dispatch] = useReducer(fileReducer, initialState);

    return (
        <FilesContext.Provider value={{files: state, dispatch}}>
            {children}
        </FilesContext.Provider>
    );
};
export {FilesContext, FilesProvider};