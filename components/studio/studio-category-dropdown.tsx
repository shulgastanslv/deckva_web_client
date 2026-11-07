"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/categories";

export function CategoryDropdown({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedLabel =
    TEMPLATE_CATEGORIES.find((category) => category === selectedCategory) || "Выберите категорию";

  const filteredCategories = TEMPLATE_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-[220px] justify-between rounded-full px-4 text-[13px] font-medium shadow-none border-none"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="ml-2 size-3.5 shrink-0 text-neutral-400" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-[220px] rounded-2xl p-0 shadow-lg border-neutral-200 dark:border-neutral-800 flex flex-col" 
        align="start"
      >
        <div className="flex items-center border-b border-neutral-100 px-3 dark:border-neutral-800 shrink-0">
          <Search className="mr-2 size-4 text-neutral-400 shrink-0" />
          <input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // Блокируем всплытие событий, чтобы пробел не закрывал DropdownMenu
            onKeyDown={(e) => e.stopPropagation()} 
            className="h-10 w-full bg-transparent text-[13px] outline-none placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Прокручиваемый список категорий */}
        <div className="p-1 max-h-[240px] overflow-y-auto">
          {/* Сброс выбора (показывается только если категория выбрана) */}
          {selectedCategory && (
            <DropdownMenuItem
              onClick={() => {
                onSelectCategory("");
                setSearch("");
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] cursor-pointer text-red-600 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-950/30 mb-1"
            >
              <div className="flex size-4 items-center justify-center shrink-0">
                <X className="size-3.5" />
              </div>
              <span className="font-medium">Сбросить выбор</span>
            </DropdownMenuItem>
          )}

          {filteredCategories.length === 0 ? (
            <div className="py-4 text-center text-[13px] text-neutral-500">
              Ничего не найдено.
            </div>
          ) : (
            filteredCategories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => {
                  onSelectCategory(category);
                  setSearch("");
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800"
              >
                <div className="flex size-4 items-center justify-center shrink-0">
                  {selectedCategory === category && (
                    <Check className="size-3.5 text-neutral-900 dark:text-neutral-100" strokeWidth={3} />
                  )}
                </div>
                <span className={cn(
                  "text-neutral-600 dark:text-neutral-400 transition-colors",
                  selectedCategory === category && "font-medium text-neutral-900 dark:text-neutral-100"
                )}>
                  {category}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}