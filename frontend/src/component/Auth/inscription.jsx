import { SignUp } from "../../lib/clerk-shim";

export default function Inscription() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A2540] p-4">
      <SignUp routing="path" path="/auth/inscription" signInUrl="/auth/connexion" />
    </div>
  );
}
