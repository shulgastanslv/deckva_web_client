"use client";

import * as React from "react";
import { Search, ChevronDown, Crop, X } from "lucide-react";
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
}

export function RatioSelect({ currentRatio, onRatioChange }: CustomRatioSelectProps) {
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
          variant="secondary" 
          className="flex items-center gap-2 rounded-full px-5 h-10"
        >
          <Crop className="w-4 h-4" />
          <span className="w-8 text-center">{currentRatio}</span>
          <ChevronDown className="w-4 h-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-[340px] p-0 rounded-3xl overflow-hidden border" 
        align="start"
      >
        {/* Строка поиска */}
        <div className="p-3 border-b">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 bg-muted/50 border-none rounded-full h-10 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
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
    <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={onClick}>
      <div 
        className={`
          flex items-center justify-center rounded-2xl border transition-all duration-200
          ${active 
            ? 'bg-blue-500 text-primary-foreground shadow-md' 
            : 'bg-muted/50 border-transparent text-foreground group-hover:bg-accent group-hover:text-accent-foreground'
          }
          ${boxClassName}
        `}
      >
        {children ? (
          <div className={active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"}>
            {children}
          </div>
        ) : (
          <span className="text-sm font-semibold">{value}</span>
        )}
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground font-medium transition-colors">
        {label}
      </span>
    </div>
  );
}