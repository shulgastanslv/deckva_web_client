import { Check, ChevronDown, LayoutGrid, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function StudioPageActions({
  sort,
  setSort,
}: {
  sort: string;
  setSort: (val: string) => void;
}) {
  return (
    <>
      {/* Левый блок фильтров */}
      <div className="flex items-center gap-2">
        <Select defaultValue="anyone">
          <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-border/60 bg-transparent px-4 text-[13px] shadow-none hover:bg-muted/50 focus:ring-0 [&>span]:line-clamp-1">
            <SelectValue placeholder="Owned by anyone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anyone">Owned by anyone</SelectItem>
            <SelectItem value="me">Owned by me</SelectItem>
            <SelectItem value="not-me">Not owned by me</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-border/60 bg-transparent px-4 text-[13px] shadow-none hover:bg-muted/50 focus:ring-0 [&>span]:line-clamp-1">
            <SelectValue placeholder="Space" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Space</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Правый блок (отталкивается в край благодаря ml-auto) */}
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 rounded-full border-border/60 bg-transparent px-4 text-[13px] shadow-none hover:bg-muted/50 data-[state=open]:border-blue-600 data-[state=open]:text-blue-600"
            >
              Sort <ChevronDown className="ml-1 size-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            {[
              { id: "last-opened", label: "Last opened" },
              { id: "last-modified", label: "Last modified" },
              { id: "alphabetical", label: "Alphabetically" },
              { id: "last-created", label: "Last created" },
            ].map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => setSort(option.id)}
                className="flex items-center gap-2 rounded-lg text-[13px]"
              >
                <div className="flex w-4 items-center justify-center">
                  {sort === option.id && <Check className="size-4" />}
                </div>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Переключатель вида (Сетка / Список) */}
        <div className="flex h-9 items-center gap-0.5 rounded-lg border border-border/60 bg-transparent p-0.5 shadow-none">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-md bg-muted shadow-sm hover:bg-muted"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-md text-muted-foreground hover:text-foreground"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}