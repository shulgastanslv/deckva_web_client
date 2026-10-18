import Image from "next/image";

export function EditorStage() {
  return (
    <div className="relative mx-auto w-full" aria-hidden>
      <Image
        src="/editor.svg"
        alt="Editor Stage"
        width={720}
        height={500}
        className="h-auto w-full select-none"
        priority
      />
    </div>
  );
}