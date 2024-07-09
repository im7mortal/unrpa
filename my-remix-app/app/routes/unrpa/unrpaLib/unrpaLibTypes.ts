export interface FileHeader {
    Name: string
    Offset: number,
    Len: number
    Field?: string // I don't know what is it
}

export interface MetadataResponse {
    FileHeaders: FileHeader[]
    Error: string,
}