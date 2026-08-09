import { router } from '@inertiajs/react';
import { Camera, LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    kind: 'avatar' | 'cover';
    className?: string;
};

export function ProfileMediaButton({ kind, className }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';

                    if (!file) {
                        return;
                    }

                    setUploading(true);
                    router.post(
                        '/settings/profile/media',
                        { [kind]: file },
                        {
                            forceFormData: true,
                            preserveScroll: true,
                            onFinish: () => setUploading(false),
                        },
                    );
                }}
            />
            <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    'inline-flex items-center justify-center gap-1.5 rounded-full bg-black/65 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/80 disabled:opacity-70',
                    className,
                )}
                aria-label={
                    kind === 'avatar'
                        ? 'Change profile photo'
                        : 'Change cover photo'
                }
            >
                {uploading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                ) : (
                    <Camera className="size-4" />
                )}
                {kind === 'cover' ? (
                    <span className="hidden text-xs font-semibold sm:inline">
                        Edit cover
                    </span>
                ) : null}
            </button>
        </>
    );
}
