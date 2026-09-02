import { SignUp } from "@clerk/clerk-react";

const RegisterPage = () => {
  return (
    <div className="flex h-[calc(100vh-80px)] items-center justify-center">
      <SignUp signInUrl="/login" afterSignUpUrl />
    </div>
  );
};

export default RegisterPage;
