import { ImagePlus, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PostMediaItem } from '@/types';

export const MAX_POST_IMAGES = 6;

type Props = {
    errors?: Record<string, string>;
    className?: string;
    /** Existing media when editing a post. */
    existingMedia?: PostMediaItem[];
    /** Controlled list of existing media ids marked for removal. */
    removeIds?: number[];
    onRemoveIdsChange?: (ids: number[]) => void;
    /** External id so a parent toolbar Label can open the picker. */
    pickerId?: string;
    /** Hide the inline Photo control (toolbar owns it). */
    hidePickerLabel?: boolean;
    onNewFilesChange?: (count: number) => void;
};

type PreviewItem = {
    file: File;
    url: string;
};

function syncInputFiles(input: HTMLInputElement, files: File[]): void {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
}

/**
 * Photo picker + preview grid. Supports existing media (edit) with remove ids
 * and new file picks, capped at MAX_POST_IMAGES total kept items.
 */
export function MediaUploader({
    errors = {},
    className,
    existingMedia = [],
    removeIds = [],
    onRemoveIdsChange,
    pickerId: pickerIdProp,
    hidePickerLabel = false,
    onNewFilesChange,
}: Props) {
    const autoId = useId();
    const pickerId = pickerIdProp ?? autoId;
    const submitRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<PreviewItem[]>([]);

    const keptExisting = existingMedia.filter(
        (item) => !removeIds.includes(item.id),
    );
    const slotsLeft = Math.max(
        0,
        MAX_POST_IMAGES - keptExisting.length - previews.length,
    );

    function applyFiles(nextFiles: File[]): void {
        const maxNew = Math.max(0, MAX_POST_IMAGES - keptExisting.length);
        const limited = nextFiles.slice(0, maxNew);

        setPreviews((current) => {
            current.forEach((item) => URL.revokeObjectURL(item.url));

            return limited.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            }));
        });

        if (submitRef.current) {
            syncInputFiles(submitRef.current, limited);
        }

        onNewFilesChange?.(limited.length);
    }

    function onChange(event: ChangeEvent<HTMLInputElement>): void {
        const incoming = Array.from(event.target.files ?? []);
        const combined = [...previews.map((item) => item.file), ...incoming];
        applyFiles(combined);
        event.target.value = '';
    }

    function removeNewAt(index: number): void {
        const next = previews
            .filter((_, i) => i !== index)
            .map((item) => item.file);
        applyFiles(next);
    }

    function removeExisting(id: number): void {
        if (!onRemoveIdsChange || removeIds.includes(id)) {
            return;
        }

        onRemoveIdsChange([...removeIds, id]);
    }

    return (
        <div className={cn('space-y-2', className)}>
            {keptExisting.length > 0 || previews.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2">
                    {keptExisting.map((item) => (
                        <li
                            key={`existing-${item.id}`}
                            className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                        >
                            <img
                                src={item.url}
                                alt=""
                                className="size-full object-cover"
                            />
                            {onRemoveIdsChange ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-1 right-1 size-7 rounded-full"
                                    onClick={() => removeExisting(item.id)}
                                >
                                    <X className="size-3.5" />
                                    <span className="sr-only">
                                        Remove image
                                    </span>
                                </Button>
                            ) : null}
                        </li>
                    ))}
                    {previews.map((item, index) => (
                        <li
                            key={item.url}
                            className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                        >
                            <img
                                src={item.url}
                                alt=""
                                className="size-full object-cover"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="absolute top-1 right-1 size-7 rounded-full"
                                onClick={() => removeNewAt(index)}
                            >
                                <X className="size-3.5" />
                                <span className="sr-only">Remove image</span>
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : null}

            {removeIds.map((id) => (
                <input
                    key={`remove-${id}`}
                    type="hidden"
                    name="remove_media_ids[]"
                    value={id}
                />
            ))}

            <div className="flex items-center gap-2">
                {!hidePickerLabel ? (
                    <Label
                        htmlFor={pickerId}
                        className={cn(
                            'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/10',
                            slotsLeft === 0 &&
                                'pointer-events-none opacity-50',
                        )}
                    >
                        <ImagePlus className="size-4" />
                        Photo
                    </Label>
                ) : null}
                <input
                    id={pickerId}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    disabled={slotsLeft === 0}
                    onChange={onChange}
                />
                <input
                    ref={submitRef}
                    name="images[]"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden
                />
                {!hidePickerLabel ? (
                    <span className="text-xs text-muted-foreground">
                        Max {MAX_POST_IMAGES}
                    </span>
                ) : null}
            </div>

            <InputError message={errors.images} />
            <InputError message={errors['images.0']} />
        </div>
    );
}
