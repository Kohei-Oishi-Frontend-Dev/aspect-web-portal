import React, { useState } from "react";
import { Link } from "react-router-dom";
import EmailInput from "../../components/EmailInput";
import Button from "../../components/Button";
import aspectLogo from "../../assets/aspect-logo-primary.svg";
import chumleyLogo from "../../assets/chumley_logo.jpg";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
  const AUTH_URL_PROXY = "/auth-api/services/oauth2/token";
  const FORGOT_PASSWORD_URL_PROXY = "/api/services/apexrest/ForgotPassword";

  const handleSendResetLink = async () => {
    setError("");
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      setError("Configuration error: Missing Client ID or Secret.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenResponse = await fetch(AUTH_URL_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error(
          tokenData.error_description || "Could not authenticate application."
        );
      }

      const accessToken = tokenData.access_token;

      const resetResponse = await fetch(FORGOT_PASSWORD_URL_PROXY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username: email }),
      });

      const resetData = await resetResponse.json();

      if (resetResponse.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error(resetData.message || "Failed to send reset link.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-2 bg-[#90A8D1] overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7D9CC0] to-[#90A8D1]">
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#6C87B5] rounded-full opacity-40"></div>
        <div className="absolute top-[-100px] right-[-150px] w-[600px] h-[600px] bg-[#6C87B5] rounded-full opacity-30"></div>
      </div>

      <div className="relative max-w-md w-full flex flex-col items-stretch gap-6 px-8 py-12 bg-white rounded-lg shadow-md z-10">
        <div className="flex justify-center mb-4">
          <img src={aspectLogo} alt="Aspect Logo" className="h-14 w-auto" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          {!isSubmitted ? (
            <>
              <h1 className="text-xl font-bold text-gray-800">
                Reset your password
              </h1>
              <p className="text-sm text-gray-500">
                Enter your email and we'll send you instructions on how to reset
                your password.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-800">
                Check your email
              </h1>
              <p className="text-sm text-gray-500">
                We have sent password reset instructions to your email address
                if an associated account exists.
              </p>
            </>
          )}
        </div>

        {!isSubmitted && (
          <div className="flex flex-col items-center gap-4">
            <EmailInput
              value={email}
              onChange={setEmail}
              label=""
              placeholder="Enter your email"
              required
              error={error}
            />
            {error && (
              <div className="text-red-600 text-sm text-center" role="alert">
                <p>{error}</p>
              </div>
            )}
            <Button
              onClick={handleSendResetLink}
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 bg-[#2457A6] text-[#D3E000] hover:bg-[#1E4A8A] rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </div>
        )}

        <Link
          to="/login"
          className="text-sm text-center text-gray-600 hover:underline"
        >
          Back to sign in
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
          <span className="mr-2">powered by:</span>
          <img src={chumleyLogo} alt="Chumley Logo" className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
