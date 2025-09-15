import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import EmailInput from "../../components/EmailInput";
import PasswordInput from "../../components/PasswordInput";
import Button from "../../components/Button";
import aspectLogo from "../../assets/Logomark.jpg";
import chumleyLogo from "../../assets/chumley_logo.jpg";
import bgImage from "../../assets/background.jpg";

const GREY = "#646F86"; // subtitle/placeholder
const ERR = "#812F1D"; // Text/Label & border in Figma
const ERR_BG = "#FAEDEA"; // Surface/Subtle bg

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined
  );
  const [bannerError, setBannerError] = useState("");

  // Count failed attempts (invalid inputs OR wrong credentials)
  const [failedAttempts, setFailedAttempts] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
  const AUTH_URL_PROXY = "/auth-api/services/oauth2/token";
  const LOGIN_API_URL_PROXY = "/api/services/apexrest/UserLogin";

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // Show Sign Up only after 3 failures
  const showSignup = failedAttempts >= 3;

  const registerFail = () => setFailedAttempts((n) => n + 1);

  const preValidate = () => {
    let ok = true;
    setEmailError(undefined);
    setPasswordError(undefined);
    setBannerError("");

    if (!email || !isEmail(email)) {
      setEmailError("Invalid email address");
      ok = false;
    }
    if (!password || password.length < 6) {
      setPasswordError("Passwords must be at least six characters.");
      ok = false;
    }
    if (!CLIENT_ID || !CLIENT_SECRET) {
      setBannerError("Configuration error: Missing Client ID or Secret.");
      ok = false;
    }
    return ok;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!preValidate()) {
      registerFail();
      return;
    }

    setIsSubmitting(true);
    setBannerError("");

    try {
      // 1) OAuth
      const tokenResponse = await fetch(AUTH_URL_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CLIENT_ID!,
          client_secret: CLIENT_SECRET!,
        }),
      });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData?.access_token) {
        throw new Error(
          tokenData?.error_description || "Could not authenticate application."
        );
      }
      const accessToken = tokenData.access_token;

      // 2) Login
      const loginResponse = await fetch(LOGIN_API_URL_PROXY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username: email, password }),
      });
      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.statusCode === 200) {
        setFailedAttempts(0);
        sessionStorage.setItem("authToken", accessToken);
        sessionStorage.setItem("userId", loginData.userId);
        sessionStorage.setItem("accountId", loginData.accountId);
        sessionStorage.setItem("userAccess", loginData.userAccess);
        sessionStorage.setItem("sectorType", loginData.sectorType);
        navigate("/home");
      } else {
        registerFail();
        setBannerError(
          "Your login attempt has failed. Make sure the username and password are correct."
        );
      }
    } catch (_err) {
      registerFail();
      setBannerError(
        "Your login attempt has failed. Make sure the username and password are correct."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // When banner is showing, we want both inputs to adopt the full error skin & text color
  const forceErrorSkin = !!bannerError;

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 md:p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-md px-8 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={aspectLogo} className="h-16 w-auto" alt="Aspect" />
        </div>

        {/* Banner: centered, Figma color */}
        {bannerError && (
          <p className="mb-4 text-center text-sm leading-snug text-[#812F1D]">
            {bannerError}
          </p>
        )}

        {/* Form (fixed width 390px like Figma) */}
        <form
          onSubmit={handleLogin}
          className="mx-auto flex w-[390px] max-w-full flex-col gap-4"
        >
          {/* Username */}
          <EmailInput
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (isEmail(v)) setEmailError(undefined);
              if (bannerError) setBannerError("");
            }}
            label="Username"
            error={emailError}
            labelClassName={bannerError ? "text-[#812F1D]" : "text-[#646F86]"}
            className={
              bannerError
                ? "!text-[#812F1D] bg-[#FAEDEA] border-[#812F1D] ring-2 ring-[#812F1D] placeholder-[#646F86]"
                : "text-black border-gray-300 focus:ring-2 focus:ring-[#2457A6] placeholder-[#646F86]"
            }
          />

          {/* Password */}
          <PasswordInput
            value={password}
            onChange={(v) => {
              setPassword(v);
              setPasswordError(
                v && v.length < 6
                  ? "Passwords must be at least six characters."
                  : undefined
              );
              if (bannerError) setBannerError("");
            }}
            label="Password"
            error={passwordError}
            validatePassword={false}
            labelClassName={bannerError ? "text-[#812F1D]" : "text-[#646F86]"}
            className={
              bannerError || passwordError
                ? "!text-[#812F1D] bg-[#FAEDEA] border-[#812F1D] ring-2 ring-[#812F1D] placeholder-[#646F86]"
                : "text-black border-gray-300 focus:ring-2 focus:ring-[#2457A6] placeholder-[#646F86]"
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-1 h-11 w-full rounded bg-[#2457A6] text-[#D3E000] hover:bg-[#1E4A8A] disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>

          {/* Footer row: Sign Up (left) — Forgot password? (right) */}
          {showSignup ? (
            <div className="mt-3 flex w-full items-center justify-between text-[12px]">
              <div className="text-[#646F86]">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-extrabold text-[#646F86] underline"
                >
                  Sign Up
                </Link>
              </div>
              <Link to="/forgot-password" className="text-[#646F86] underline">
                Forgot password?
              </Link>
            </div>
          ) : (
            <div className="mt-3 flex w-full items-center justify-center">
              <Link
                to="/forgot-password"
                className="text-[12px] text-[#646F86] underline"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </form>

        <div className="mt-8 flex items-center justify-center text-xs text-[#646F86]">
          <span className="mr-2">powered by:</span>
          <img src={chumleyLogo} alt="Chumley Logo" className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default Login;
