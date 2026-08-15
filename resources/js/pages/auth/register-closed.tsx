import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';

export default function RegisterClosed() {
    return (
        <>
            <Head title="Registration closed" />

            <p className="text-center text-sm text-muted-foreground">
                Accounts are created by an administrator for learners, students,
                and interns approved by PLT. Log in if you already have one.
            </p>

            <div className="text-center text-sm">
                <TextLink href={login()} tabIndex={1}>
                    Log in
                </TextLink>
            </div>
        </>
    );
}

RegisterClosed.layout = {
    title: 'Registration closed',
    description:
        'New accounts are created by an administrator for approved members.',
};
