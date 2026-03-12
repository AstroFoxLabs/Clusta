import type { ImportedDataState } from '@excalidraw/excalidraw/data/types';

type Keys<T> = keyof T;
type Values<T> = T[keyof T];

export type IpcResponse<T> = IpcSuccess<T> | IpcError;

type LastID = string | number;

type ExcalidrawSceneData = ImportedDataState;

interface ExcalidrawSceneRecord {
    uuid: string;
    name: string;
    added_at: string;
    updated_at: string;
}

interface ExcalidrawScene extends ExcalidrawSceneData, ExcalidrawSceneRecord {
    mutated?: boolean;
}

export interface CatalogImage {
    id: string;
    hash: string;
    name: string;
    tags: CatalogTag[];
    categories: CatalogCategory[];
    is_favorite: boolean;
    added_at: string;
    updated_at: string;
}

export interface CatalogTag {
    id: string;
    technical_name: string;
}

export interface CatalogCategory {
    id: string;
    display_name: string;
    technical_name: string;
}

export type ImageExtension = 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'avif' | 'tiff' | 'tif' | 'svg';

export type AllowedMimeType =
    | 'image/png'
    | 'image/jpeg'
    | 'image/gif'
    | 'image/webp'
    | 'image/avif'
    | 'image/tiff'
    | 'image/tif'
    | 'image/svg+xml'
    | 'image/jpg';

interface FilePayload {
    name: string;
    size: number;
    data: Uint8Array;
    hash: string;
}

export interface ImageFilePayload extends FilePayload {
    mimeType: AllowedMimeType;
}

export interface Coordinates {
    x: number;
    y: number;
}

type UUID = string;
