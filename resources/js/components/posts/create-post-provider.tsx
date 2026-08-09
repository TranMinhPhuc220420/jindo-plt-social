import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { PostComposerShell } from '@/components/posts/post-composer-shell';

type CreatePostContextValue = {
    openCreatePost: () => void;
    isOpen: boolean;
};

const CreatePostContext = createContext<CreatePostContextValue | null>(null);

export function CreatePostProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState(0);

    const openCreatePost = useCallback(() => {
        setSession((value) => value + 1);
        setOpen(true);
    }, []);

    const value = useMemo(
        () => ({ openCreatePost, isOpen: open }),
        [openCreatePost, open],
    );

    return (
        <CreatePostContext.Provider value={value}>
            {children}
            <PostComposerShell
                key={session}
                open={open}
                onOpenChange={setOpen}
                mode="create"
                action="/posts"
            />
        </CreatePostContext.Provider>
    );
}

export function useCreatePost(): CreatePostContextValue {
    const ctx = useContext(CreatePostContext);

    if (!ctx) {
        throw new Error('useCreatePost must be used within CreatePostProvider');
    }

    return ctx;
}

/** Optional hook when provider may be absent (e.g. guest pages). */
export function useCreatePostOptional(): CreatePostContextValue | null {
    return useContext(CreatePostContext);
}
