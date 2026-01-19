import { SignIn } from "@clerk/nextjs";
import { Camera } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход — PhotoMarket",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">С возвращением!</h1>
          <p className="text-gray-500 mt-2">Войдите в PhotoMarket</p>
        </div>

        {/* Clerk SignIn */}
        <SignIn
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none bg-transparent p-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-white border border-gray-200 hover:bg-gray-50 rounded-xl py-3 transition-all",
              socialButtonsBlockButtonText: "font-medium text-gray-700",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500 text-sm",
              formFieldLabel: "text-sm font-medium text-gray-700 mb-1",
              formFieldInput:
                "w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-slate-200 transition-all",
              formButtonPrimary:
                "w-full py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200",
              footerActionLink:
                "text-slate-700 font-semibold hover:text-slate-900",
              identityPreviewEditButton: "text-slate-600 hover:text-slate-800",
              formFieldInputShowPasswordButton:
                "text-gray-500 hover:text-gray-700",
              alert: "rounded-xl",
              alertText: "text-sm",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
            },
          }}
        />
      </div>
    </div>
  );
}
