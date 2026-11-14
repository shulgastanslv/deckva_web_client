---
name: deckva-ui-style
description: >-
  Deckva studio UI style for Button, Select, Dropdown, Dialog, Popover, Input,
  Tabs and chips. Miro-like soft rects (rounded-md, not pills). Select/Tabs:
  rounded-md, font-normal, generous padding; prefer shadcn Select over native.
  Triggers without borders/shadows; menus/popovers/select use bg-popover +
  shadow-sm (light: border-0; dark: border-border/50); dialogs use
  bg-background + border-border/50. Button default = sm (h-9); control height
  via `controlH` / `controlSize` in `components/ui/control.ts` (currently h-9 /
  size-9). Use when building or restyling studio controls, shadcn overrides, or
  when the user mentions кнопки, select, tabs, dropdown, dialog, UI стиль,
  дизайн-система студии, Miro, button sm.
---

# Deckva UI style (studio)

Полный канон на русском: [`docs/ui-components-style.md`](../../../docs/ui-components-style.md).

Перед любой правкой контролов в студии **прочитай этот документ** и следуй ему вместо дефолтов shadcn.

## Краткие инварианты

1. **Кнопки / чипы / инпуты / сегменты / табы / select / filter Apply** — **Miro-like**: `rounded-md`, не `rounded-full` и не `rounded-lg` на самом контроле. Круги только для аватаров, свитчей, цветовых точек, бейджей, puck на regulation pad.
2. **Триггеры / инпуты / чипы / кнопки** — **без** `shadow-*` и без видимых `border` (`border-none`).
3. **Menus / popovers / select content** — `bg-popover text-popover-foreground shadow-sm border-0 dark:border dark:border-border/50` (не `shadow-none` / `shadow-md+`).
4. **Dialogs** — `bg-background text-foreground border border-border/50 shadow-none` (не `bg-popover`, не `shadow-sm`).
5. **Высота = Button `sm`**: **`controlH` / `controlSize` / `controlField`** из `components/ui/control.ts` (сейчас **`h-9` / `size-9`**). `<Button>` по умолчанию `size="sm"`. Input и SelectTrigger делят **`controlField`** (одинаковые h/px/text). Не дублируй `h-*` / `size-*` на Button / Input / SelectTrigger; для сырых `<button>` / shell — `cn(..., controlH)` / `controlField` / `controlSize`.
6. **Один размер везде в продуктовом chrome**: settings / profile, все диалоги, хедер студии, dropdown / popover триггеры, search + соседний icon button, Input рядом с Select. Соседи в одном ряду — одна высота.
7. Поверхности контролов: `bg-muted/20` → `/30` → `/40` → `/50` → `/60`.
8. Только шаблонные токены: `bg-primary`, `bg-foreground`, `bg-muted`, `bg-background`, `bg-popover`, `text-foreground`, `text-muted-foreground`, `text-primary-foreground`, `border-border` — без кучи dark-вариаций и hex (исключение: `dark:border-border/50` на меню).
9. Триггеры и чипы: `rounded-md` + `bg-muted/40` + `hover:bg-muted/60`.
10. Меню: `rounded-2xl`, пункты `rounded-md` + `focus:bg-muted/50`. Диалоги: `rounded-3xl`.
11. Left sidebar panels: общий `sidebarPanel` (`px-3.5 py-3 gap-3`).
12. Иконки как в Miro: **`size-5 stroke-[1.5]`** (`navIconClass` / `menuIconClass`). Мелкие шевроны — `size-3`–`size-3.5`.
13. Типографика контролов: **`font-normal`** на Select / Tabs / пунктах меню (не `font-medium` / `font-semibold` на лейблах триггера и item).

## Button sm (обязательно)

```tsx
// текст / CTA — дефолт уже sm
<Button variant="secondary">Invite</Button>
<Button>Save</Button>

// icon-only — size-9
<Button size="icon" variant="secondary" aria-label="Add">
  <Plus className="size-5 stroke-[1.5]" />
</Button>
```

| | |
|---|---|
| Дефолт | `size="sm"` → `controlH` (`h-9`) |
| Icon | `size="icon"` → `controlSize` (`size-9`) |
| Где | header, settings/profile, все Dialog, dropdown/popover triggers, toolbar chips |
| Нельзя | локальные `h-10` / `h-11` / `size-10` / `size-11`; разный размер у Search и «+»; Save выше Input |

## Select (обязательно)

Предпочитай **shadcn** `Select` из `@/components/ui/select` — не нативный `<select>`.

В sidebar используй токен `sidebarSelectTrigger` из `components/canvas/sidebar/sidebar-ui.ts`.

```tsx
<SelectTrigger
  className={cn(
    "w-full rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-normal shadow-none",
    "hover:bg-muted/60 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring/20",
  )}
>
  <SelectValue />
</SelectTrigger>

<SelectContent className="rounded-2xl p-1.5">
  <SelectItem className="rounded-md py-2.5 pl-3.5 pr-10 text-[13px] font-normal focus:bg-muted/50">
    …
  </SelectItem>
</SelectContent>
```

Правила Select:

| | |
|---|---|
| Триггер | `rounded-md`, высота из `SelectTrigger`/`controlH`, `bg-muted/40`, `px-3.5`, `text-[13px] font-normal`, **без** border/shadow |
| Content | `rounded-2xl p-1.5` (или `p-2`), surface из примитива |
| Item | `rounded-md`, `py-2.5`, `pl-3.5`, `font-normal`, `focus:bg-muted/50` (не `bg-accent`) |
| Нельзя | `rounded-full` на триггере/item; нативный `<select>`; жирный `font-medium` на лейбле |

Позиционирование меню (если нужно сдвинуть): `position="popper"` + `side` / `sideOffset` / `align` / `alignOffset` на `SelectContent`.

## Tabs (обязательно)

Оболочка + триггеры — оба **`rounded-md`**. Shared: `sidebarTabsList` / `sidebarTabsTrigger` (и `sidebarSegmented*` для сегментов).

```tsx
<TabsList className={cn(sidebarTabsList, "grid-cols-4")}>
  <TabsTrigger value="a" className={sidebarTabsTrigger}>
    Label
  </TabsTrigger>
</TabsList>
```

Правила Tabs:

| | |
|---|---|
| List | `rounded-md`, высота из `controlH` (`h-9`), `p-1`, `bg-muted/40` или `sidebarSurfaceIdle` |
| Trigger | `rounded-md`, `px-3`, `text-[13px] font-normal` |
| Active | `bg-background text-foreground` — **без** `ring-*` |
| Нельзя | `rounded-full` / pills; `font-medium` на лейбле; icon-only ряд, если нужен текст |

Горизонтальный скролл (много пунктов): обёртка `overflow-x-auto` + триггеры `flex-none` / `shrink-0` + `whitespace-nowrap`; при необходимости wheel → `scrollLeft`. Не сжимай табы через `flex-1`, иначе скролла не будет.

Для taxonomy/browse в сайдбаре по умолчанию — **Select / FilterMenu** рядом с поиском, а не постоянная полоса табов (см. Filters over chrome).

## Floating surface (обязательно)

Канон уже в примитивах:

- `components/ui/dropdown-menu.tsx` → Content / SubContent → `bg-popover` + `shadow-sm` + `border-0` + `dark:border-border/50`
- `components/ui/select.tsx` → SelectContent → то же
- `components/ui/popover.tsx` → PopoverContent → то же
- `components/ui/dialog.tsx` → DialogContent → `bg-background` + `border-border/50` + `shadow-none`

На call-site **не** перебивай surface (`border`, чужой `bg-*`, `shadow-md`/`shadow-lg`, `ring-*`).  
Оставляй только размер/паддинг/скругление, например: `className="w-56 rounded-2xl p-1.5"`.

## Когда применять

- Новые или правка Button / Select / Tabs / Dropdown / Dialog / Popover / Input в `components/studio/**`, `components/header.tsx`, canvas chrome
- Пользователь просит «в нашем стиле», «без теней на кнопках», «как Miro», «muted», `shadow-sm` на меню, **button sm**
- Расхождение с `components/ui/*` — **перекрывай `className`**, не плоди темы; для surface цвета/тени правь примитив

## Не применять

- Маркетинговый лендинг (`land-*`) — отдельная система
- Сырые дефолты shadcn (`shadow-md`, `border-input`, `outline` variant) как целевой вид студии
- `rounded-full` на Select / Tabs / Button / chips (исключение: аватары, свитчи, точки)
