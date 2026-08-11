import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

export const MainScrollContainerContext =
    createContext<RefObject<HTMLElement | null> | null>(null);

export function useMainScrollContainer(): RefObject<HTMLElement | null> | null {
    return useContext(MainScrollContainerContext);
}
