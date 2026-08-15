import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { isFirebaseConfigured } from '@/lib/firebase';
import { subscribeUserInbox } from '@/lib/realtime';
import type { Auth, ConversationSummary } from '@/types';

type PageProps = {
    auth: Auth;
};

export type InboxState = {
    conversations: ConversationSummary[];
    /** True until the first RTDB snapshot (or a failure) resolves. */
    loading: boolean;
};

/**
 * Live inbox from RTDB `users/{uid}/inbox`.
 */
export function useInbox(): InboxState {
    const { auth } = usePage<PageProps>().props;
    const userId = auth.user?.id;
    const canSubscribe = Boolean(userId) && isFirebaseConfigured();
    const [state, setState] = useState<InboxState>({
        conversations: [],
        loading: canSubscribe,
    });

    useEffect(() => {
        if (!userId || !canSubscribe) {
            return;
        }

        return subscribeUserInbox(userId, (conversations) => {
            setState({ conversations, loading: false });
        });
    }, [userId, canSubscribe]);

    return state;
}
