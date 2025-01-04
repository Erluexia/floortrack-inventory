import { useNavigate } from "react-router-dom";
import { SignupForm } from "@/components/auth/SignupForm";

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create an account</h2>
          <p className="mt-2 text-gray-600">Sign up to get started</p>
        </div>

        <SignupForm onSuccess={() => navigate("/login")} />

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;