import { SignUp } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";

export const SignUpPage = () => {
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect_url') || '/';

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <SignUp
                    path="/signup"
                    routing="path"
                    signInUrl={`/signin${searchParams.get('redirect_url') ? `?redirect_url=${encodeURIComponent(searchParams.get('redirect_url')!)}` : ''}`}
                    forceRedirectUrl={redirectUrl}
                />
            </div>
        </div>
    );
};
