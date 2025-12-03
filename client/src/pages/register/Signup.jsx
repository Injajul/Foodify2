import React, { useEffect } from "react";
import { SignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex  items-center justify-center bg-gray-900">
      <SignUp signInUrl="/login" afterSignUpUrl="/" />
    </div>
  );
}
