"use client";

import { useState } from "react";
import {
  ArrowRight,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "5 трендов веб-дизайна в 2024 году",
  "Как бороться с выгоранием на фрилансе",
  "Пошаговый план запуска стартапа",
];

export function PromptSection() {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    window.location.href = `/studio?topic=${encodeURIComponent(prompt.trim())}`;
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl sm:leading-[1.08] text-land-ink text-center mb-8">
        Start with a prompt
        </h2>
      
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col overflow-hidden rounded-3xl bg-land-card"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Введите тему, например: Как составить идеальное резюме..."
          className="w-full min-h-[140px] rounded-3xl resize-none border-none bg-transparent p-6 text-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-neutral-500"
          maxLength={200}
        />
        
        <div className="flex justify-end p-4 pt-0">
          <Button
            variant="default"
            type="submit"
            className="h-10 rounded-full px-6 text-[13px] font-medium transition-all"
            disabled={!prompt.trim()}
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>

      {/* Упрощенные сайджесты */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setPrompt(suggestion)}
            className="h-9 rounded-full px-4 text-[13px] font-medium border-none bg-land-card"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}