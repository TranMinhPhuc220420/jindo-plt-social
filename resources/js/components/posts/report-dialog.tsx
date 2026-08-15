import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const REASONS = [
    { value: 'harassment', label: 'Harassment or defamation' },
    { value: 'fraud', label: 'Fraud or scam' },
    { value: 'illegal', label: 'Illegal content' },
    { value: 'copyright', label: 'Copyright (books, software, textbooks)' },
    { value: 'other', label: 'Other' },
] as const;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportableType: 'post' | 'comment';
    reportableId: number;
};

export function ReportDialog({
    open,
    onOpenChange,
    reportableType,
    reportableId,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Report this {reportableType}</DialogTitle>
                    <DialogDescription>
                        Moderators will review this against the community rules.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    action="/reports"
                    method="post"
                    className="grid gap-4"
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="reportable_type"
                                value={reportableType}
                            />
                            <input
                                type="hidden"
                                name="reportable_id"
                                value={reportableId}
                            />
                            <fieldset className="grid gap-2">
                                <legend className="text-sm font-medium">
                                    Reason
                                </legend>
                                {REASONS.map((reason) => (
                                    <Label
                                        key={reason.value}
                                        className="flex items-center gap-2 font-normal"
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={reason.value}
                                            required
                                            className="size-4"
                                        />
                                        {reason.label}
                                    </Label>
                                ))}
                                <InputError message={errors.reason} />
                            </fieldset>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor={`report-details-${reportableType}-${reportableId}`}
                                >
                                    Details (optional)
                                </Label>
                                <textarea
                                    id={`report-details-${reportableType}-${reportableId}`}
                                    name="details"
                                    rows={3}
                                    maxLength={500}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                                <InputError message={errors.details} />
                                <InputError message={errors.reportable_id} />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? <Spinner /> : null}
                                    Submit report
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
