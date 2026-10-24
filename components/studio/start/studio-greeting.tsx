export function StudioGreeting({ signedIn }: { signedIn?: boolean }) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
        New carousel
      </h1>
      <p className="max-w-md text-[14px] leading-relaxed text-muted-foreground">
        {signedIn
          ? "Describe an idea, pick a template, or start blank."
          : "Sign in to save drafts and jump back in."}
      </p>
    </div>
  );
}
