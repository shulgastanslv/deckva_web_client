"use client";

import React, { use, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  checkCredentials,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from "@/actions/auth-email";
import { registerUser } from "@/actions/user";
import { Loader2 } from "lucide-react";
import Logo from "./logo/logo";

type View = "login" | "register" | "forgot-password" | "reset-password" | "check-email";
type CheckKind = "verify" | "reset";

const verifyRequests = new Map<string, ReturnType<typeof verifyEmail>>();

function queryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function callbackUrlFromQuery(): string {
  return queryParam("callbackUrl") || "/studio";
}

function authErrorMessage(code: string): string {
  if (code === "AccessDenied") return "Google did not confirm this email.";
  return "Couldn't sign in with Google. Try again.";
}

function verifyEmailOnce(token: string) {
  const existing = verifyRequests.get(token);
  if (existing) return existing;
  const request = verifyEmail(token);
  verifyRequests.set(token, request);
  return request;
}

interface AuthModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  required?: boolean;
  verifyToken?: string | null;
  resetToken?: string | null;
}

export function AuthModal({
  isOpen,
  onOpenChange,
  required = false,
  verifyToken = null,
  resetToken = null,
}: AuthModalProps) {
  const [view, setView] = useState<View>("login");
  const [checkKind, setCheckKind] = useState<CheckKind>("verify");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const shownAuthError = useRef(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setErrorMessage(null);
    setInfoMessage(null);
    setUnverifiedEmail(null);
  };

  useEffect(() => {
    if (!verifyToken) return;
    let cancelled = false;
    setView("login");
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    void verifyEmailOnce(verifyToken).then((res) => {
      if (cancelled) return;
      setIsLoading(false);
      if ("error" in res && res.error) setErrorMessage(res.error);
      else setInfoMessage("Email confirmed. You can sign in.");
    });

    return () => {
      cancelled = true;
    };
  }, [verifyToken]);

  useEffect(() => {
    if (!resetToken) return;
    setView("reset-password");
    setErrorMessage(null);
    setInfoMessage(null);
    setPassword("");
  }, [resetToken]);

  useEffect(() => {
    if (shownAuthError.current) return;
    const code = queryParam("error");
    if (!code) return;
    shownAuthError.current = true;
    setView("login");
    setInfoMessage(null);
    setErrorMessage(authErrorMessage(code));
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const handleSwitchView = (newView: View) => {
    setView(newView);
    resetForm();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && required) return;
    if (!open) {
      setView("login");
      resetForm();
    }
    onOpenChange?.(open);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const callbackUrl = callbackUrlFromQuery();

      // 1. Register a new account
      if (view === "register") {
        const res = await registerUser({ name, email, password });
        if ("error" in res && res.error && !("needsVerification" in res)) {
          setErrorMessage(res.error);
          setIsLoading(false);
          return;
        }

        setCheckKind("verify");
        setView("check-email");
        setInfoMessage(
          "error" in res && res.error
            ? res.error
            : "delivered" in res && res.delivered === false
              ? "Account created. Email is not configured, so the confirmation link was printed in the server log."
              : `We sent a confirmation link to ${email.trim()}.`,
        );
        setIsLoading(false);
        return;
      }

      // 2. Sign in with a password
      if (view === "login") {
        const check = await checkCredentials(email, password);
        if ("error" in check && check.error) {
          setErrorMessage(check.error);
          setUnverifiedEmail("code" in check && check.code === "unverified" ? email.trim() : null);
          setIsLoading(false);
          return;
        }

        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl,
        });

        if (res?.error) {
          setErrorMessage("Incorrect email or password");
        } else {
          onOpenChange?.(false);
          router.refresh();
        }
        setIsLoading(false);
        return;
      }

      if (view === "forgot-password") {
        const res = await requestPasswordReset(email);
        if ("error" in res && res.error) {
          setErrorMessage(res.error);
        } else {
          setCheckKind("reset");
          setView("check-email");
          setInfoMessage(
            "delivered" in res && res.delivered === false
              ? "Email is not configured. If this account exists, the reset link was printed in the server log."
              : "If an account exists for that email, we sent a reset link.",
          );
        }
        setIsLoading(false);
        return;
      }

      if (view === "reset-password") {
        if (!resetToken) {
          setErrorMessage("This reset link is missing. Request a new one.");
          setIsLoading(false);
          return;
        }
        const res = await resetPassword(resetToken, password);
        if ("error" in res && res.error) {
          setErrorMessage(res.error);
        } else {
          setPassword("");
          setView("login");
          setInfoMessage("Password updated. Sign in with the new one.");
        }
        setIsLoading(false);
      }
    } catch {
      setErrorMessage("Something went wrong. Try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: callbackUrlFromQuery(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!required}
        className="w-full max-w-md rounded-3xl p-0 gap-0 border border-border"
        onPointerDownOutside={required ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={required ? (e) => e.preventDefault() : undefined}
        onInteractOutside={required ? (e) => e.preventDefault() : undefined}
      >
        <div className="p-8 flex flex-col justify-center">

          {/* Error banner */}
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-[13px] text-destructive text-center">
              {errorMessage}
              {unverifiedEmail && (
                <button
                  type="button"
                  className="mt-2 block w-full text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    setIsLoading(true);
                    void sendVerificationEmail(unverifiedEmail).then((res) => {
                      setIsLoading(false);
                      if ("error" in res && res.error) setErrorMessage(res.error);
                      else {
                        setErrorMessage(null);
                        setCheckKind("verify");
                        setView("check-email");
                        setInfoMessage(`We sent a confirmation link to ${unverifiedEmail}.`);
                      }
                    });
                  }}
                >
                  Resend confirmation email
                </button>
              )}
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 rounded-xl bg-muted px-3 py-3 text-center text-[13px] text-foreground">
              {infoMessage}
            </div>
          )}

          {/* ==================== LOGIN VIEW ==================== */}
          {view === "login" && (
            <>
              <DialogHeader className="space-y-1 mb-6 text-center">
                <div className="flex items-center justify-center mb-4"> 
                  <Logo width={36} height={36} />
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Welcome back
                </DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  Sign in and pick up right where you left off.
                </DialogDescription>
              </DialogHeader>

              <Button
                variant="outline"
                type="button"
                className="w-full h-10 rounded-full text-[13px] font-medium transition-all mb-6 flex items-center justify-center gap-2 border-input bg-muted/50 hover:bg-accent"
                onClick={handleGoogleSignIn}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.8 7.3C.7 9.5 0 10.7 0 12.5s.7 3 1.8 5.2l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.6-2.2-6.5-5.2L1.8 15.8C3.7 19.5 7.5 23 12 23z" />
                </svg>
                Continue with Google
              </Button>

              <Divider text="Or continue with email" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1.5">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-full bg-muted/50 border-input"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-medium text-foreground">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSwitchView("forgot-password")}
                      className="text-[13px] text-muted-foreground hover:text-primary transition-colors bg-transparent p-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 rounded-full bg-muted/50 border-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-semibold mt-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>

              <div className="text-center mt-6 text-[13px] text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchView("register")}
                  className="text-primary font-medium hover:underline bg-transparent p-0"
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {/* ==================== REGISTER VIEW ==================== */}
          {view === "register" && (
            <>
              <DialogHeader className="space-y-1 mb-6 text-center">
                <div className="flex items-center justify-center mb-4"> 
                  <Logo width={36} height={36} />
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Create an account
                </DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  Sign up to get started and create carousels.
                </DialogDescription>
              </DialogHeader>

              <Button
                variant="outline"
                type="button"
                className="w-full h-10 rounded-full text-[13px] font-medium transition-all mb-6 flex items-center justify-center gap-2 border-input bg-muted/50 hover:bg-accent"
                onClick={handleGoogleSignIn}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.8 7.3C.7 9.5 0 10.7 0 12.5s.7 3 1.8 5.2l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.6-2.2-6.5-5.2L1.8 15.8C3.7 19.5 7.5 23 12 23z" />
                </svg>
                Continue with Google
              </Button>

              <Divider text="Or register with email" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1.5">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10 rounded-full bg-muted/50 border-input"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1.5">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-full bg-muted/50 border-input"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1.5">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 rounded-full bg-muted/50 border-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-semibold mt-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
                </Button>
              </form>

              <div className="text-center mt-6 text-[13px] text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchView("login")}
                  className="text-primary font-medium hover:underline bg-transparent p-0"
                >
                  Sign in
                </button>
              </div>
            </>
          )}

          {/* ==================== FORGOT PASSWORD VIEW ==================== */}
          {view === "forgot-password" && (
            <>
              <DialogHeader className="space-y-1 mb-6 text-center">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Reset password
                </DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1.5">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-full bg-muted/50 border-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-semibold mt-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
                </Button>
              </form>

              <div className="text-center mt-6 text-[13px] text-muted-foreground">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchView("login")}
                  className="text-primary font-medium hover:underline bg-transparent p-0"
                >
                  Back to Sign in
                </button>
              </div>
            </>
          )}

          {view === "reset-password" && (
            <>
              <DialogHeader className="space-y-1 mb-6 text-center">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Choose a new password
                </DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  This link works once and expires in one hour.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1.5">
                    New password
                  </label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-10 rounded-full bg-muted/50 border-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-semibold mt-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
                </Button>
              </form>
            </>
          )}

          {view === "check-email" && (
            <>
              <DialogHeader className="space-y-1 mb-6 text-center">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Check your email
                </DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  {checkKind === "verify"
                    ? "Open the confirmation link, then come back and sign in."
                    : "Open the reset link in the message to choose a new password."}
                </DialogDescription>
              </DialogHeader>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 rounded-full text-[13px]"
                onClick={() => handleSwitchView("login")}
              >
                Back to Sign in
              </Button>
            </>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

const Divider = ({ text }: { text: string }) => (
  <div className="relative flex items-center justify-center mb-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border" />
    </div>
    <span className="relative px-3 text-[13px] tracking-wider uppercase text-muted-foreground font-semibold bg-background">
      {text}
    </span>
  </div>
);
