"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  checkCredentials,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from "@/actions/auth-email";
import { registerUser } from "@/actions/user";
import {
  Eye,
  EyeSlash as EyeOff,
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";
import Logo from "./logo/logo";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { cn } from "@/lib/utils";

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

function verifyEmailOnce(token: string) {
  const existing = verifyRequests.get(token);
  if (existing) return existing;
  const request = verifyEmail(token);
  verifyRequests.set(token, request);
  return request;
}

function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((open) => !open)}
        className={cn(
          "absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md",
          "text-muted-foreground transition-colors hover:text-foreground",
        )}
      >
        {visible ? (
          <EyeOff className="size-5 stroke-[1.5]" />
        ) : (
          <Eye className="size-5 stroke-[1.5]" />
        )}
      </button>
    </div>
  );
}

function FieldLabel({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-[13px] font-normal text-foreground",
        className,
      )}
    >
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.8 7.3C.7 9.5 0 10.7 0 12.5s.7 3 1.8 5.2l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.6-2.2-6.5-5.2L1.8 15.8C3.7 19.5 7.5 23 12 23z"
      />
    </svg>
  );
}

interface AuthModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  required?: boolean;
  verifyToken?: string | null;
  resetToken?: string | null;
}

function stripAuthParams() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of ["verify", "reset", "error", "auth"] as const) {
    if (!url.searchParams.has(key)) continue;
    url.searchParams.delete(key);
    changed = true;
  }
  if (changed) {
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
}

export function AuthModal({
  isOpen,
  onOpenChange,
  required = false,
  verifyToken = null,
  resetToken = null,
}: AuthModalProps) {
  const t = useTranslations("dialogs.auth");
  const te = useTranslations("errors");
  const [view, setView] = useState<View>("login");
  const [checkKind, setCheckKind] = useState<CheckKind>("verify");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [linkVerify, setLinkVerify] = useState<string | null>(null);
  const [linkReset, setLinkReset] = useState<string | null>(null);

  const router = useRouter();
  const shownAuthError = useRef(false);
  const consumedLink = useRef(false);

  const activeVerify = verifyToken || linkVerify;
  const activeReset = resetToken || linkReset;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setErrorMessage(null);
    setInfoMessage(null);
    setUnverifiedEmail(null);
  };

  // Pick up ?verify= / ?reset= from any page that mounts AuthModal (landing included).
  useEffect(() => {
    if (consumedLink.current) return;
    const verify = queryParam("verify");
    const reset = queryParam("reset");
    const code = queryParam("error");
    if (!verify && !reset && !code) return;
    consumedLink.current = true;

    if (verify) {
      setLinkVerify(verify);
      onOpenChange?.(true);
    }
    if (reset) {
      setLinkReset(reset);
      onOpenChange?.(true);
    }
    if (code && !shownAuthError.current) {
      shownAuthError.current = true;
      setView("login");
      setInfoMessage(null);
      setErrorMessage(
        code === "AccessDenied" ? t("googleUnconfirmed") : t("googleFailed"),
      );
      onOpenChange?.(true);
    }
    stripAuthParams();
  }, [onOpenChange, t]);

  useEffect(() => {
    if (!activeVerify) return;
    let cancelled = false;
    setView("login");
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    void verifyEmailOnce(activeVerify).then((res) => {
      if (cancelled) return;
      setIsLoading(false);
      if ("error" in res && res.error) setErrorMessage(res.error);
      else setInfoMessage(t("emailConfirmed"));
    });

    return () => {
      cancelled = true;
    };
  }, [activeVerify, t]);

  useEffect(() => {
    if (!activeReset) return;
    setView("reset-password");
    setErrorMessage(null);
    setInfoMessage(null);
    setPassword("");
  }, [activeReset]);

  const handleSwitchView = (newView: View) => {
    setView(newView);
    resetForm();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && required) return;
    if (!open) {
      setView("login");
      resetForm();
      setLinkVerify(null);
      setLinkReset(null);
    }
    onOpenChange?.(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const callbackUrl = callbackUrlFromQuery();

      // 1. Register a new account (user is kept only if verification email sends)
      if (view === "register") {
        const res = await registerUser({ name, email, password });
        if ("error" in res && res.error) {
          setErrorMessage(res.error);
          setIsLoading(false);
          return;
        }

        setCheckKind("verify");
        setView("check-email");
        setInfoMessage(t("sentConfirm", { email: email.trim() }));
        setIsLoading(false);
        return;
      }

      // 2. Sign in with a password
      if (view === "login") {
        const check = await checkCredentials(email, password);
        if ("error" in check && check.error) {
          const code = "code" in check ? check.code : undefined;
          setErrorMessage(
            code === "google" ? te("useGoogleSignIn") : check.error,
          );
          setUnverifiedEmail(code === "unverified" ? email.trim() : null);
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
          setErrorMessage(te("incorrectCredentials"));
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
              ? t("emailNotConfiguredDev")
              : t("sentResetIfExists"),
          );
        }
        setIsLoading(false);
        return;
      }

      if (view === "reset-password") {
        if (!activeReset) {
          setErrorMessage(t("resetLinkMissing"));
          setIsLoading(false);
          return;
        }
        const res = await resetPassword(activeReset, password);
        if ("error" in res && res.error) {
          setErrorMessage(res.error);
        } else {
          setPassword("");
          setView("login");
          setInfoMessage(t("passwordUpdated"));
        }
        setIsLoading(false);
      }
    } catch {
      setErrorMessage(t("tryAgain"));
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
        className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-sm"
        onPointerDownOutside={required ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={required ? (e) => e.preventDefault() : undefined}
        onInteractOutside={required ? (e) => e.preventDefault() : undefined}
      >
        <div className="flex flex-col justify-center p-5">
          {errorMessage && (
            <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2.5 text-center text-[13px] font-normal text-destructive">
              {errorMessage}
              {unverifiedEmail && (
                <button
                  type="button"
                  className="mt-1.5 block w-full text-[13px] font-normal text-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    setIsLoading(true);
                    void sendVerificationEmail(unverifiedEmail).then((res) => {
                      setIsLoading(false);
                      if ("error" in res && res.error) setErrorMessage(res.error);
                      else {
                        setErrorMessage(null);
                        setCheckKind("verify");
                        setView("check-email");
                        setInfoMessage(t("sentConfirm", { email: unverifiedEmail }));
                      }
                    });
                  }}
                >
                  {t("resendConfirm")}
                </button>
              )}
            </div>
          )}

          {infoMessage && (
            <div className="mb-3 rounded-md bg-muted/40 px-3 py-2.5 text-center text-[13px] font-normal text-foreground">
              {infoMessage}
            </div>
          )}

          {view === "login" && (
            <>
              <DialogHeader className="mb-4 space-y-1 text-center">
                <div className="mb-3 flex items-center justify-center">
                  <Logo width={42} height={42} />
                </div>
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  {t("welcomeBack")}
                </DialogTitle>
                <DialogDescription className="text-[13px] font-normal text-muted-foreground">
                  {t("welcomeSub")}
                </DialogDescription>
              </DialogHeader>

              <Button
                variant="secondary"
                type="button"
                className="mb-4 w-full font-normal"
                onClick={handleGoogleSignIn}
              >
                <GoogleIcon />
                {t("continueGoogle")}
              </Button>

              <Divider text={t("orContinueEmail")} />

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <FieldLabel>{t("email")}</FieldLabel>
                  <Input
                    type="email"
                    placeholder={t("phEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <FieldLabel className="mb-0">{t("password")}</FieldLabel>
                    <button
                      type="button"
                      onClick={() => handleSwitchView("forgot-password")}
                      className="bg-transparent p-0 text-[13px] font-normal text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="mt-1 w-full font-normal">
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    t("signIn")
                  )}
                </Button>
              </form>

              <AuthLegalAgree />

              <div className="mt-4 text-center text-[13px] font-normal text-muted-foreground">
                {t("noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchView("register")}
                  className="bg-transparent p-0 font-normal text-primary hover:underline"
                >
                  {t("signUp")}
                </button>
              </div>
            </>
          )}

          {view === "register" && (
            <>
              <DialogHeader className="mb-4 space-y-1 text-center">
                <div className="mb-3 flex items-center justify-center">
                  <Logo width={32} height={32} />
                </div>
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  {t("createTitle")}
                </DialogTitle>
                <DialogDescription className="text-[13px] font-normal text-muted-foreground">
                  {t("createSub")}
                </DialogDescription>
              </DialogHeader>

              <Button
                variant="secondary"
                type="button"
                className="mb-4 w-full font-normal"
                onClick={handleGoogleSignIn}
              >
                <GoogleIcon />
                {t("continueGoogle")}
              </Button>

              <Divider text={t("orRegisterEmail")} />

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <FieldLabel>{t("fullName")}</FieldLabel>
                  <Input
                    type="text"
                    placeholder={t("phName")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>{t("email")}</FieldLabel>
                  <Input
                    type="email"
                    placeholder={t("phEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>{t("password")}</FieldLabel>
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    placeholder={t("phPasswordMin")}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="mt-1 w-full font-normal">
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    t("createAccount")
                  )}
                </Button>
              </form>

              <AuthLegalAgree />

              <div className="mt-4 text-center text-[13px] font-normal text-muted-foreground">
                {t("haveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchView("login")}
                  className="bg-transparent p-0 font-normal text-primary hover:underline"
                >
                  {t("signIn")}
                </button>
              </div>
            </>
          )}

          {view === "forgot-password" && (
            <>
              <DialogHeader className="mb-4 space-y-1 text-center">
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  {t("resetTitle")}
                </DialogTitle>
                <DialogDescription className="text-[13px] font-normal text-muted-foreground">
                  {t("resetSub")}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-1 space-y-3">
                <div>
                  <FieldLabel>{t("email")}</FieldLabel>
                  <Input
                    type="email"
                    placeholder={t("phEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="mt-1 w-full font-normal">
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    t("sendResetLink")
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center text-[13px] font-normal text-muted-foreground">
                {t("rememberPassword")}{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchView("login")}
                  className="bg-transparent p-0 font-normal text-primary hover:underline"
                >
                  {t("backToSignIn")}
                </button>
              </div>
            </>
          )}

          {view === "reset-password" && (
            <>
              <DialogHeader className="mb-4 space-y-1 text-center">
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  {t("choosePasswordTitle")}
                </DialogTitle>
                <DialogDescription className="text-[13px] font-normal text-muted-foreground">
                  {t("choosePasswordSub")}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-1 space-y-3">
                <div>
                  <FieldLabel>{t("newPassword")}</FieldLabel>
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    placeholder={t("phPasswordMin")}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="mt-1 w-full font-normal">
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    t("updatePassword")
                  )}
                </Button>
              </form>
            </>
          )}

          {view === "check-email" && (
            <>
              <DialogHeader className="mb-4 space-y-1 text-center">
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  {t("checkEmailTitle")}
                </DialogTitle>
                <DialogDescription className="text-[13px] font-normal text-muted-foreground">
                  {checkKind === "verify"
                    ? t("checkEmailConfirm")
                    : t("checkEmailReset")}
                </DialogDescription>
              </DialogHeader>

              <Button
                type="button"
                variant="secondary"
                className="w-full font-normal"
                onClick={() => handleSwitchView("login")}
              >
                {t("backToSignIn")}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuthLegalAgree() {
  const t = useTranslations("dialogs.auth");
  return (
    <p className="mt-3 text-center text-[12px] font-normal leading-relaxed text-muted-foreground">
      {t.rich("agreeLegal", {
        terms: (chunks) => (
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline-offset-2 hover:underline"
          >
            {chunks}
          </Link>
        ),
        privacy: (chunks) => (
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline-offset-2 hover:underline"
          >
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}

const Divider = ({ text }: { text: string }) => (
  <div className="relative mb-4 flex items-center justify-center">
    <div className="absolute inset-0 flex items-center">
      <div className="h-px w-full bg-muted" />
    </div>
    <span className="relative bg-background px-2.5 text-[12px] font-normal text-muted-foreground">
      {text}
    </span>
  </div>
);
