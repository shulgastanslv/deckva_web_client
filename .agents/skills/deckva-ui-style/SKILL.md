---
name: deckva-ui-style
description: >-
  Deckva studio UI style for Button, Select, Dropdown, Dialog, Popover, Input
  and chips. Triggers without borders/shadows; menus/popovers/select use
  bg-popover + shadow-sm (light: border-0; dark: border-border/50); dialogs use
  bg-background + border-border/50. h-9/h-10, bg-muted opacity ladder, semantic
  tokens only. Use when building or restyling studio controls, shadcn overrides,
  or when the user mentions кнопки, select, dropdown, dialog, UI стиль,
  дизайн-система студии.
---

# Deckva UI style (studio)

Полный канон на русском: [`docs/ui-components-style.md`](../../../docs/ui-components-style.md).

Перед любой правкой контролов в студии **прочитай этот документ** и следуй ему вместо дефолтов shadcn.

## Краткие инварианты

1. **Триггеры / инпуты / чипы / кнопки** — **без** `shadow-*` и без видимых `border` (`border-none`).
2. **Menus / popovers / select** — `bg-popover text-popover-foreground shadow-sm border-0 dark:border dark:border-border/50` (не `shadow-none` / `shadow-md+`).
3. **Dialogs** — `bg-background text-foreground border border-border/50 shadow-none` (не `bg-popover`, не `shadow-sm`).
4. Высота: **`h-9`** или **`h-10`**.
5. Поверхности контролов: `bg-muted/20` → `/30` → `/40` → `/50` → `/60`.
6. Только шаблонные токены: `bg-primary`, `bg-foreground`, `bg-muted`, `bg-background`, `bg-popover`, `text-foreground`, `text-muted-foreground`, `text-primary-foreground`, `border-border` — без кучи dark-вариаций и hex (исключение: `dark:border-border/50` на меню).
7. Триггеры и чипы: `rounded-full` + `bg-muted/40` + `hover:bg-muted/60`.
8. Меню: `rounded-2xl`, пункты `rounded-xl` + `focus:bg-muted/50`. Диалоги: `rounded-3xl`.

## Floating surface (обязательно)

Канон уже в примитивах:

- `components/ui/dropdown-menu.tsx` → Content / SubContent → `bg-popover` + `shadow-sm` + `border-0` + `dark:border-border/50`
- `components/ui/select.tsx` → SelectContent → то же
- `components/ui/popover.tsx` → PopoverContent → то же
- `components/ui/dialog.tsx` → DialogContent → `bg-background` + `border-border/50` + `shadow-none`

На call-site **не** перебивай surface (`border`, чужой `bg-*`, `shadow-md`/`shadow-lg`, `ring-*`).  
Оставляй только размер/паддинг/скругление, например: `className="w-56 rounded-2xl p-1.5"`.

## Когда применять

- Новые или правка Button / Select / Dropdown / Dialog / Popover / Input в `components/studio/**`, `components/header.tsx`, canvas chrome
- Пользователь просит «в нашем стиле», «без теней на кнопках», «как чипы», «muted», `shadow-sm` на меню
- Расхождение с `components/ui/*` — **перекрывай `className`**, не плоди темы; для surface цвета/тени правь примитив

## Не применять

- Маркетинговый лендинг (`land-*`) — отдельная система
- Сырые дефолты shadcn (`shadow-md`, `border-input`, `outline` variant) как целевой вид студии
