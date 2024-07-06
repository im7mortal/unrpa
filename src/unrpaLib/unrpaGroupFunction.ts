import {FileHeader} from "./unrpaLibTypes";


export interface GroupZipSort {
    subPath: string
    entries: FileHeader[]
    totalSize: number
}

export type GroupFilesFunction = (entries: FileHeader[], maxSizeInBytes?: number) => GroupZipSort[][];

export function groupSimpleOne(entries: FileHeader[]): GroupZipSort[][] {
    const allFilesGroup: GroupZipSort = {
        subPath: "",
        entries: entries,
        totalSize: entries.reduce((total, entry) => total + entry.Len, 0)
    };

    return [[allFilesGroup]];
}

export function groupBySize(entries: FileHeader[], maxSizeInBytes: number = 250 * 1024 * 1024): GroupZipSort[][] {
    let chunks: GroupZipSort[][] = [];
    let currentChunk: GroupZipSort = {subPath: "", entries: [], totalSize: 0};

    entries.forEach((entry: FileHeader) => {
        if (currentChunk.totalSize + entry.Len > maxSizeInBytes) {
            chunks.push([currentChunk]);
            currentChunk = {subPath: "", entries: [], totalSize: 0};
        }

        currentChunk.entries.push(entry);
        currentChunk.totalSize += entry.Len;
    });

    if (currentChunk.entries.length > 0) {
        chunks.push([currentChunk]);
    }

    return chunks;
}

export function groupBySubdirectory(entries: FileHeader[], maxSizeInBytes: number = 250 * 1024 * 1024): GroupZipSort[][] {
    const groups: { [key: string]: GroupZipSort } = {};

    entries.forEach((entry: FileHeader) => {
        const subPath: string = entry.Name.substring(0, entry.Name.lastIndexOf('/'));

        if (!groups[subPath]) {
            groups[subPath] = {subPath: subPath, entries: [], totalSize: 0};
        }

        groups[subPath].entries.push(entry);
        groups[subPath].totalSize += entry.Len;
    });

    const groupsArray: any[] = [];
    for (const key in groups) {
        if (groups.hasOwnProperty(key)) {
            groupsArray.push(groups[key]);
        }
    }

    groupsArray.sort((a: any, b: any) => a.subPath.localeCompare(b.subPath));

    let chunks: GroupZipSort[][] = [];
    let currentChunk: GroupZipSort[] = [];
    let currentChunkSize: number = 0;
    groupsArray.forEach(group => {
        if (currentChunkSize + group.totalSize > maxSizeInBytes) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentChunkSize = 0;
        }

        currentChunk.push(group);
        currentChunkSize += group.totalSize;
    });
    if (currentChunk.length !== 0) {
        chunks.push(currentChunk);
    }
    return chunks;
}
