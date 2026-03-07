import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";

export const SignUpPage = () => {
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect_url') || '/';

    return (
        <AuthLayout>
            <SignUp
                path="/signup"
                routing="path"
                signInUrl={`/signin${searchParams.get('redirect_url') ? `?redirect_url=${encodeURIComponent(searchParams.get('redirect_url')!)}` : ''}`}
                forceRedirectUrl={redirectUrl}
                appearance={{
                    baseTheme: dark,
                    variables: {
                        colorBackground: '#1E293B',
                        colorInputBackground: '#0F172A',
                        colorPrimary: '#6366F1',
                        colorText: '#F8FAFC',
                    },
                    elements: {
                        rootBox: "w-full",
                        card: "bg-transparent shadow-none border-0 w-full p-0 m-0",
                        headerTitle: "text-[#F8FAFC] text-2xl font-semibold mb-1",
                        headerSubtitle: "text-slate-400 mb-6",
                        formFieldLabel: "text-slate-300 font-medium mb-1.5",
                        formFieldInput: "bg-[#0F172A] border-slate-700 text-[#F8FAFC] rounded-lg focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors",
                        formButtonPrimary: "bg-[#6366F1] hover:bg-indigo-600 text-white rounded-lg py-2.5 font-medium transition-colors border-0 shadow-lg shadow-indigo-500/20",
                        socialButtonsBlockButton: "bg-[#0F172A] border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg py-2.5 transition-colors",
                        socialButtonsBlockButtonText: "font-medium",
                        footerActionText: "text-slate-400",
                        footerActionLink: "text-[#6366F1] hover:text-indigo-400 font-medium",
                        dividerLine: "bg-slate-700",
                        dividerText: "text-slate-400",
                        formFieldAction: "text-[#6366F1] hover:text-indigo-400",
                    },
                    layout: {
                        logoPlacement: "none",
                        socialButtonsVariant: "blockButton",
                        socialButtonsPlacement: "bottom"
                    }
                }}
            />
        </AuthLayout>
    );
};
