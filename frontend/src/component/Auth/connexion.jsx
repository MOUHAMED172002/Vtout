import { SignIn } from "@clerk/clerk-react";

export default function Connexion() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A2540] p-4">
      <SignIn routing="path" path="/auth/connexion" signUpUrl="/auth/inscription" />
    </div>
  );
}

