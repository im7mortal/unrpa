import React from "react";

const DropdownFilesContext = React.createContext<File[]>([]);

export const DropdownFilesProvider = DropdownFilesContext.Provider;

export default DropdownFilesContext;