import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OAuthFailurePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Google sign-in didn't work</h1>
                <p className="mt-2 text-base text-text-secondary">
                    We couldn't complete sign-in with Google. You can try again, or sign in with your email and password
                    instead.
                </p>
                <Link href="/login">
                    <Button type="button" size="lg" className="mt-6 w-full">
                        Back to sign in
                    </Button>
                </Link>
            </div>
        </div>
    );
}