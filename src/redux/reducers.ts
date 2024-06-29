import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {FileExtraction} from '../detectVersion';

interface FileState {
    archives: FileExtraction[];
}

const initialState: FileState = {
    archives: []
};

const fileSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        addFiles(state, action: PayloadAction<FileExtraction[]>) {
            action.payload.forEach(newFile => {
                const existingIndex = state.archives.findIndex(file => file.Id === newFile.Id);
                if (existingIndex >= 0) {
                    state.archives[existingIndex] = newFile;
                } else {
                    state.archives.push(newFile);
                }
            });
        },
        removeFile(state, action: PayloadAction<string>) {
            state.archives = state.archives.filter(file => file.Id !== action.payload);
        }
    }
});

export const { addFiles, removeFile } = fileSlice.actions;
export default fileSlice.reducer;
