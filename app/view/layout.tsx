import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
});

export default function ViewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${manrope.className} min-h-dvh bg-[#f6f4fb] text-[#14151c] dark:bg-[#121212] dark:text-white`}>
      {children}
    </div>
  );
}
