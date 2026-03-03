import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";

export const SignInPage = () => {
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect_url') || '/';

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <SignIn
                    path="/signin"
                    routing="path"
                    signUpUrl={`/signup${searchParams.get('redirect_url') ? `?redirect_url=${encodeURIComponent(searchParams.get('redirect_url')!)}` : ''}`}
                    forceRedirectUrl={redirectUrl}
                />
            </div>
        </div>
    );
};
