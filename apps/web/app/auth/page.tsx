"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent, KeyboardEvent } from "react";
import Image from "next/image";

// Type definitions
type AuthStep = "email" | "otp" | "success";

// Email validation helper
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Mask email for display
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  
  const maskedLocal = local.length > 2 
    ? local[0] + "*".repeat(local.length - 2) + local[local.length - 1]
    : local;
    
  const domainParts = domain.split(".");
  if (domainParts.length > 1) {
    const maskedDomain = domainParts[0].length > 2
      ? domainParts[0][0] + "*".repeat(domainParts[0].length - 2) + domainParts[0][domainParts[0].length - 1]
      : domainParts[0];
    return `${maskedLocal}@${maskedDomain}.${domainParts.slice(1).join(".")}`;
  }
  
  return `${maskedLocal}@${domain}`;
}

// Email Input Screen Component
function EmailScreen({
  onSubmit,
  isLoading,
}: {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched) {
      if (!value) {
        setError("Email is required");
      } else if (!validateEmail(value)) {
        setError("Please enter a valid email address");
      } else {
        setError("");
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (!email) {
      setError("Email is required");
    } else if (!validateEmail(email)) {
      setError("Please enter a valid email address");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    onSubmit(email);
  };

  const handleGoogleSignIn = () => {
    // Mock Google sign in
    console.log("Google sign in clicked");
  };

  const handleAppleSignIn = () => {
    // Mock Apple sign in
    console.log("Apple sign in clicked");
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Back Button */}
      <button
        type="button"
        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
      >
        <Image
          src="/icons/arrow-left.svg"
          alt="Back"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Logo - Centered */}
      <div className="flex justify-center mb-6">
        <Image
          src="/logo/agora logo.svg"
          alt="Agora"
          width={120}
          height={40}
          className="h-10 w-auto"
        />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">
          Welcome to agora
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Enter your email to sign in or create an account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Image
                src="/icons/mail.svg"
                alt="Email"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <input
              ref={inputRef}
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              disabled={isLoading}
              className={`
                w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white
                text-black placeholder:text-gray-400
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-black/10
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-gray-200 focus:border-black"
                }
              `}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1 ml-4">{error}</p>
          )}
        </div>

        {/* Submit Button - Yellow */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 px-6 rounded-full font-semibold
            flex items-center justify-center gap-2
            transition-all duration-200
            bg-[#FACC15] text-black
            hover:bg-[#EAB308] hover:shadow-lg
            active:scale-[0.98]
            disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none
          `}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Continue...</span>
            </>
          ) : (
            <>
              <span>Continue with Email</span>
              <Image
                src="/icons/arrow-right.svg"
                alt="Arrow"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Social Sign In Buttons */}
        <div className="space-y-3">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="
              w-full py-3 px-6 rounded-full font-medium
              flex items-center justify-center gap-3
              transition-all duration-200
              bg-white text-black border-2 border-gray-200
              hover:bg-gray-50 hover:border-gray-300
              active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Image
              src="/icons/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span>Sign in with Google</span>
          </button>

          {/* Apple Sign In */}
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="
              w-full py-3 px-6 rounded-full font-medium
              flex items-center justify-center gap-3
              transition-all duration-200
              bg-black text-white
              hover:bg-gray-900 hover:shadow-lg
              active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            "
          >
            <Image
              src="/icons/apple.svg"
              alt="Apple"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span>Sign in with Apple</span>
          </button>
        </div>
      </form>

      {/* Terms */}
      <p className="text-center text-xs text-gray-500 mt-6">
        By continuing, you agree to our{" "}
        <a href="#" className="underline hover:text-gray-700">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-gray-700">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

// OTP Input Component
function OtpInput({
  value,
  index,
  onChange,
  onBackspace,
  inputRef,
}: {
  value: string;
  index: number;
  onChange: (index: number, value: string) => void;
  onBackspace: (index: number) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(val)) {
      onChange(index, val);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value && index > 0) {
        onBackspace(index);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Handle paste at index 0
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={`
        w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold
        rounded-xl border-2 bg-white
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-black/10
        ${value 
          ? "border-black" 
          : "border-gray-200 focus:border-black"
        }
      `}
    />
  );
}

// OTP Verification Screen Component
function OtpScreen({
  email,
  onVerify,
  onBack,
  isLoading,
}: {
  email: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    setError("");
    const newDigits = [...digits];
    
    if (value.length > 1) {
      // Handle paste - fill from this position
      const pasteDigits = value.slice(0, 5 - index).split("");
      pasteDigits.forEach((d, i) => {
        if (index + i < 5) {
          newDigits[index + i] = d;
        }
      });
      setDigits(newDigits);
      
      // Focus on the next empty cell or the last one
      const nextEmptyIndex = newDigits.findIndex((d, i) => i >= index && !d);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[4]?.focus();
      }
    } else {
      newDigits[index] = value;
      setDigits(newDigits);
      
      // Auto-focus next input
      if (value && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleBackspace = (index: number) => {
    const newDigits = [...digits];
    newDigits[index - 1] = "";
    setDigits(newDigits);
    inputRefs.current[index - 1]?.focus();
  };

  const otpCode = digits.join("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 5) {
      setError("Please enter all 5 digits");
      return;
    }
    
    if (!/^\d{5}$/.test(otpCode)) {
      setError("Please enter a valid 5-digit code");
      return;
    }
    
    onVerify(otpCode);
  };

  const handleResend = () => {
    // Mock resend functionality
    console.log("Resend OTP requested");
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
      >
        <Image
          src="/icons/arrow-left.svg"
          alt="Back"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Logo - Centered */}
      <div className="flex justify-center mb-6">
        <Image
          src="/logo/agora logo.svg"
          alt="Agora"
          width={120}
          height={40}
          className="h-10 w-auto"
        />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">
          Check your email
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          We sent a 5-digit code to{" "}
          <span className="font-medium text-black">{maskEmail(email)}</span>
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {digits.map((digit, index) => (
            <OtpInput
              key={index}
              value={digit}
              index={index}
              onChange={handleDigitChange}
              onBackspace={handleBackspace}
              inputRef={(el) => {
                inputRefs.current[index] = el;
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Verify Button - Yellow */}
        <button
          type="submit"
          disabled={isLoading || otpCode.length !== 5}
          className={`
            w-full py-3 px-6 rounded-full font-semibold
            flex items-center justify-center gap-2
            transition-all duration-200
            bg-[#FACC15] text-black
            hover:bg-[#EAB308] hover:shadow-lg
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
          `}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify Code</span>
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-black hover:underline"
            >
              Resend
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

// Success Screen Component
function SuccessScreen() {
  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <Image
            src="/icons/checkmark-circle-01.svg"
            alt="Success"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">
        You're All Set!
      </h1>
      <p className="text-gray-600 text-sm sm:text-base mb-8">
        Your account has been verified successfully.
      </p>

      {/* Continue Button */}
      <button
        className="
          w-full py-3 px-6 rounded-full font-semibold
          flex items-center justify-center gap-2
          transition-all duration-200
          bg-black text-white
          hover:bg-gray-900 hover:shadow-lg
          active:scale-[0.98]
        "
      >
        <span>Continue to Dashboard</span>
        <Image
          src="/icons/arrow-right.svg"
          alt="Arrow"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      </button>
    </div>
  );
}

// Main Auth Page Component
export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = (emailValue: string) => {
    setEmail(emailValue);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleOtpVerify = () => {
    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1200);
  };

  const handleBack = () => {
    setStep("email");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Logo - Only show on email screen */}
      {step === "email" && (
        <header className="w-full py-6 px-4">
          <div className="max-w-[1221px] mx-auto">
            <div className="flex items-center gap-2">
              <Image
                src="/logo/agora logo.svg"
                alt="Agora"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full">
          {step === "email" && (
            <EmailScreen
              onSubmit={handleEmailSubmit}
              isLoading={isLoading}
            />
          )}
          
          {step === "otp" && (
            <OtpScreen
              email={email}
              onVerify={handleOtpVerify}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
          
          {step === "success" && <SuccessScreen />}
        </div>
      </div>
    </main>
  );
}
