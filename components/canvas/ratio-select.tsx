"use client";

import * as React from "react";
import { Search, Crop, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomRatioSelectProps {
  currentRatio: string;
  onRatioChange: (ratio: string) => void;
  /** Trigger label — pass the live ratio (e.g. "4:5") for Deckva chrome. */
  label?: string;
}

export function RatioSelect({
  currentRatio,
  onRatioChange,
  label,
}: CustomRatioSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSelect = (ratio: string) => {
    onRatioChange(ratio);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          title="Canvas size"
          className="h-10 rounded-full border-none bg-transparent px-3.5 text-[13px] font-medium tabular-nums text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground data-[state=open]:bg-muted/60 data-[state=open]:text-foreground"
        >
          {label ?? currentRatio}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[340px] overflow-hidden rounded-2xl p-0"
        align="start"
      >
        <div className="border-b border-border/50 p-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sizes…"
              className="h-9 rounded-full border-none bg-muted/40 pl-9 shadow-none focus-visible:ring-2 focus-visible:ring-ring/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Основной контент */}
        <ScrollArea className="h-[400px]">
          <div className="p-5 flex flex-col gap-6">
            
            {/* Сетка стандартных пропорций */}
            <div className="flex flex-wrap gap-x-4 gap-y-5">
              <RatioCard
                label="Auto"
                value="Auto"
                active={currentRatio === "Auto"}
                onClick={() => handleSelect("Auto")}
                boxClassName="w-14 h-14"
              >
                <Crop className="w-5 h-5" />
              </RatioCard>

              <RatioCard label="Square" value="1:1" active={currentRatio === "1:1"} onClick={() => handleSelect("1:1")} boxClassName="w-14 h-14" />
              <RatioCard label="Standard" value="4:3" active={currentRatio === "4:3"} onClick={() => handleSelect("4:3")} boxClassName="w-[4.5rem] h-14" />
              <RatioCard label="Classic" value="3:2" active={currentRatio === "3:2"} onClick={() => handleSelect("3:2")} boxClassName="w-[5.5rem] h-12 mt-1" />
              <RatioCard label="Golden" value="1.618:1" active={currentRatio === "1.618:1"} onClick={() => handleSelect("1.618:1")} boxClassName="w-[4.5rem] h-11 mt-1" />
              <RatioCard label="Photo" value="5:4" active={currentRatio === "5:4"} onClick={() => handleSelect("5:4")} boxClassName="w-14 h-[4.5rem]" />
              <RatioCard label="Widescreen" value="16:9" active={currentRatio === "16:9"} onClick={() => handleSelect("16:9")} boxClassName="w-[140px] h-[5rem]" />
            </div>

            {/* Секция X (Twitter) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium px-1">
                <X className="w-4 h-4" />
                X (Twitter)
              </div>
              <div className="flex gap-4">
                <RatioCard label="Tweet Image" value="16:9" active={currentRatio === "16:9"} onClick={() => handleSelect("16:9")} boxClassName="w-[140px] h-[5rem]" />
                <RatioCard label="Header Photo" value="3:1" active={currentRatio === "3:1"} onClick={() => handleSelect("3:1")} boxClassName="w-[140px] h-[3.5rem] mt-3" />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Подвал с ручным вводом размеров */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center bg-muted/50 rounded-full overflow-hidden">
            <div className="flex flex-1 items-center px-4 py-2 border-r focus-within:bg-muted/80 transition-colors">
              <span className="text-muted-foreground font-bold text-xs mr-2">W</span>
              <input 
                type="text" 
                placeholder="Auto" 
                className="bg-transparent w-full outline-none text-sm placeholder:text-muted-foreground" 
              />
            </div>
            <div className="flex flex-1 items-center px-4 py-2 focus-within:bg-muted/80 transition-colors">
              <span className="text-muted-foreground font-bold text-xs mr-2">H</span>
              <input 
                type="text" 
                placeholder="Auto" 
                className="bg-transparent w-full outline-none text-sm placeholder:text-muted-foreground" 
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Вспомогательный компонент
interface RatioCardProps {
  label: string;
  value: string;
  active?: boolean;
  onClick: () => void;
  boxClassName: string;
  children?: React.ReactNode;
}

function RatioCard({ label, value, active, onClick, boxClassName, children }: RatioCardProps) {
  return (
    <button
      type="button"
      className="group flex cursor-pointer flex-col items-center gap-2"
      onClick={onClick}
    >
      <div
        className={`flex items-center justify-center rounded-2xl border-none transition-colors ${
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted/40 text-foreground group-hover:bg-muted/60"
        } ${boxClassName}`}
      >
        {children ? (
          <div className={active ? "text-primary-foreground" : "text-muted-foreground"}>
            {children}
          </div>
        ) : (
          <span className="text-[13px] font-semibold">{value}</span>
        )}
      </div>
      <span className="text-[12px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
      </span>
    </button>
  );
}