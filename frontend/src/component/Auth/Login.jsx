import { SignIn } from "@clerk/clerk-react";

export default function Login() {
    return (
        <div className="flex justify-center items-center min-h-[70vh] py-10 bg-gray-50">
            <SignIn routing="path" path="/auth/connexion" signUpUrl="/auth/inscription" />
        </div>
    );
}
