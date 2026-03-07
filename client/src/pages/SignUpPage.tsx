import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";

export const SignUpPage = () => {
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect_url') || '/';

    return (
        <AuthLayout>
            {(isDarkMode) => (
                <SignUp
                    path="/signup"
                    routing="path"
                    signInUrl={`/signin${searchParams.get('redirect_url') ? `?redirect_url=${encodeURIComponent(searchParams.get('redirect_url')!)}` : ''}`}
                    forceRedirectUrl={redirectUrl}
                    appearance={{
                        baseTheme: isDarkMode ? dark : undefined,
                        variables: {
                            colorBackground: isDarkMode ? '#1E293B' : '#FFFFFF',
                            colorInputBackground: isDarkMode ? '#0F172A' : '#F8FAFC',
                            colorPrimary: '#6366F1',
                            colorText: isDarkMode ? '#F8FAFC' : '#0F172A',
                        },
                        elements: {
                            rootBox: "w-full",
                            card: "bg-transparent shadow-none border-0 w-full p-0 m-0",
                            headerTitle: `${isDarkMode ? 'text-[#F8FAFC]' : 'text-slate-900'} text-2xl font-semibold mb-1`,
                            headerSubtitle: `${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-6`,
                            formFieldLabel: `${isDarkMode ? 'text-slate-300' : 'text-slate-700'} font-medium mb-1.5`,
                            formFieldInput: `${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-[#F8FAFC]' : 'bg-slate-50 border-slate-300 text-slate-900'} rounded-lg focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors`,
                            formButtonPrimary: "bg-[#6366F1] hover:bg-indigo-600 text-white rounded-lg py-2.5 font-medium transition-colors border-0 shadow-lg shadow-indigo-500/20",
                            socialButtonsBlockButton: `${isDarkMode ? 'bg-[#0F172A] border-slate-700 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'} rounded-lg py-2.5 transition-colors`,
                            socialButtonsBlockButtonText: "font-medium",
                            footerActionText: `${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`,
                            footerActionLink: "text-[#6366F1] hover:text-indigo-500 font-medium",
                            dividerLine: `${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`,
                            dividerText: `${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`,
                            formFieldAction: "text-[#6366F1] hover:text-indigo-500",
                        },
                        layout: {
                            logoPlacement: "none",
                            socialButtonsVariant: "blockButton",
                            socialButtonsPlacement: "bottom"
                        }
                    }}
                />
            )}
        </AuthLayout>
    );
};
