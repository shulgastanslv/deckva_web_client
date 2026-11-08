---
name: deckva-ui-style
description: >-
  Deckva studio UI style for Button, Select, Dropdown, Input and chips.
  No shadows, no borders, h-9/h-10, bg-muted opacity ladder, semantic tokens only
  (bg-primary, bg-muted, bg-foreground). Use when building or restyling studio
  controls, shadcn overrides, or when the user mentions кнопки, select, dropdown,
  UI стиль, дизайн-система студии.
---

# Deckva UI style (studio)

Полный канон на русском: [`docs/ui-components-style.md`](../../../docs/ui-components-style.md).

Перед любой правкой контролов в студии **прочитай этот документ** и следуй ему вместо дефолтов shadcn.

## Краткие инварианты

1. **Без** `shadow-*`.
2. **Без** видимых `border` у button / select / dropdown / input.
3. Высота: **`h-9`** или **`h-10`**.
4. Поверхности: `bg-muted/20` → `/30` → `/40` → `/50` → `/60`.
5. Только шаблонные токены: `bg-primary`, `bg-foreground`, `bg-muted`, `bg-background`, `bg-popover`, `text-foreground`, `text-muted-foreground`, `text-primary-foreground` — без кучи dark-вариаций и hex.
6. Триггеры и чипы: `rounded-full` + `bg-muted/40` + `hover:bg-muted/60`.
7. Меню: `rounded-2xl border-0 shadow-none ring-0`, пункты `rounded-xl` + `focus:bg-muted/50`.

## Когда применять

- Новые или правка Button / Select / Dropdown / Input в `components/studio/**`, `components/header.tsx`, canvas chrome
- Пользователь просит «в нашем стиле», «без теней», «как чипы», «muted»
- Расхождение с `components/ui/*` — **перекрывай `className`**, не плоди темы

## Не применять

- Маркетинговый лендинг (`land-*`) — отдельная система
- Сырые дефолты shadcn (`shadow-md`, `border-input`, `outline` variant) как целевой вид студии
