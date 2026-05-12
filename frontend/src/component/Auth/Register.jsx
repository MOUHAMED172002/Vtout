import { SignUp } from "../../lib/AuthComponents";;

export default function Register() {
    return (
        <div className="flex justify-center items-center min-h-[70vh] py-10 bg-gray-50">
            <SignUp routing="path" path="/auth/inscription" signInUrl="/auth/connexion" />
        </div>
    );
}
