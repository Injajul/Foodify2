import React, { useEffect } from "react";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex  items-center justify-center bg-gray-900">
      <SignIn signInUrl="/signup" afterSignInUrl="/" />
    </div>
  );
}
