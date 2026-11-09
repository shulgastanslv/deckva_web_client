# Deckva UI — стиль компонентов (студия)

Канон для кнопок, select, dropdown и соседних контролов в продуктовом UI (studio / canvas chrome).  
Лендинг (`land-*`) — отдельная поверхность; этот документ про **студию**.

Источник токенов: `app/globals.css` (`--primary`, `--muted`, `--foreground`, …).  
Базовые примитивы: `components/ui/{button,select,dropdown-menu,input,dialog}.tsx` — при расхождении **переопределяй через `className`**, не плоди новые темы.

---

## 1. Жёсткие правила

| Делай | Не делай |
|---|---|
| Высота контрола **`h-9`** или **`h-10`** | `h-7` / `h-8` / `h-11` без причины (кроме icon-only `size-8`/`size-9`) |
| **Без shadow** (`shadow-none`, не добавляй `shadow-*`) | `shadow-sm`, `shadow-md`, `shadow-lg` |
| Триггеры / инпуты / чипы — **без borders** (`border-none`) | `border-input`, outline-карточки ради «рамки» у кнопок |
| Menus / popover / select — **`bg-popover` + `border border-border/50`**; dialogs — **`bg-background` + `border border-border/50`** | `border-0`, `bg-white`, `ring-1 ring-foreground/10`, dialog на `bg-popover` |
| Фон контролов через **`bg-muted/…`** и семантику | Свои hex (`#f4f4f5`, `#4262ff`), `bg-white/70`, `dark:bg-input/30` как стиль по умолчанию |
| Текст через `text-foreground` / `text-muted-foreground` / `text-primary-foreground` | Куча `dark:`-веток под каждый оттенок |
| Скругление **`rounded-full`** (чипы, CTA), **`rounded-2xl`** (меню), **`rounded-3xl`** (диалоги) | Случайный микс `rounded-md` + тень |

Фокус: достаточно `focus-visible:ring-2 focus-visible:ring-ring/20` (или мягкий `ring-primary/20`). Не строй визуал вокруг `border-ring`.

---

## 2. Только шаблонные токены темы

Разрешённый набор фонов/текста (не изобретай новые «темы»):

**Фон**

- `bg-background` — страница / shell / **DialogContent** + `border-border/50`
- `bg-foreground` — сильный CTA (инверсия: текст `text-background`)
- `bg-primary` — фирменный акцент (`text-primary-foreground`)
- `bg-muted` — база «серой» заливки
- `bg-muted/20` · `/30` · `/40` · `/50` · `/60` — лестница спокойных поверхностей
- `bg-popover` — dropdown / select / popover + `border-border/50`, **без** `shadow-*`
- `bg-destructive/10` + `text-destructive` — опасные действия (не сплошной красный блок)

**Текст**

- `text-foreground`
- `text-muted-foreground`
- `text-primary` / `text-primary-foreground`
- `text-background` (на `bg-foreground`)
- `text-destructive`

**Hover / active — те же токены, другая opacity**

- `hover:bg-muted/40` → `hover:bg-muted/60`
- `hover:bg-primary/90` или `/80`
- `data-[state=open]:bg-muted/60`

**Запрещено как стиль продукта**

- Отдельные палитры `land-*` внутри студии
- Хардкод бренд-синего вместо `bg-primary` / `text-primary`
- Параллельные системы: `bg-accent` + `bg-secondary` + `bg-card` + `bg-input` + куча `dark:` — выбирай **один** спокойный путь (`muted` ladder + `primary`/`foreground`)
- Новые CSS-переменные «под компонент»

---

## 3. Лестница `bg-muted`

| Класс | Когда |
|---|---|
| `bg-muted/20` | Крупные спокойные зоны: хедер студии, оболочка промпта, фон страницы-обёртки |
| `bg-muted/30` | Поля ввода в покое; `focus` поднимает до `/40` |
| `bg-muted/40` | Чипы, триггеры select/dropdown в покое, search-поля |
| `bg-muted/50` | Secondary-кнопка / сегмент в группе |
| `bg-muted/60` | Hover / open / выбранный чип |

Пример оболочки промпта:

```tsx
<div className="rounded-[1.75rem] bg-muted/20 p-2 focus-within:bg-muted/30">
  {/* поле без border/shadow */}
</div>
```

---

## 4. Button

### Размеры

- Обычная: **`h-9`** + `px-3` / `px-3.5` + `text-[13px] font-medium`
- Крупнее в диалогах/футерах: **`h-10`**
- Icon-only: `size-8` или `size-9`, `rounded-full`

### Варианты (минимум)

| Роль | Классы |
|---|---|
| Primary CTA | `h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90` **или** `bg-foreground text-background hover:bg-foreground/90` |
| Secondary / спокойная | `h-9 rounded-full border-none bg-muted/40 text-foreground shadow-none hover:bg-muted/60` |
| Ghost / иконка | `rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground` |
| Destructive | `text-destructive hover:bg-destructive/10` (без жирной заливки) |

Через `<Button>`:

```tsx
<Button
  variant="secondary"
  className="h-9 rounded-full border-none bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60"
>
  Действие
</Button>

<Button className="h-10 rounded-full px-5 text-[13px] font-medium">
  Создать
</Button>
```

### Не делать для Button

- `variant="outline"` как дефолт студии (тянет border + dark-ветки)
- `shadow-*`
- Смешение `rounded-lg` + border «как в shadcn demo»
- Высоты `h-7` / `sm` для основных действий

---

## 5. Select

Триггер должен выглядеть как **мягкий чип**, не как outlined input.

```tsx
<SelectTrigger
  className={cn(
    "h-9 w-auto gap-1.5 rounded-full border-none bg-muted/40 px-3 text-[13px] shadow-none",
    "hover:bg-muted/60 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring/20",
    "data-[state=open]:bg-muted/60",
  )}
>
  <SelectValue placeholder="Выберите…" />
</SelectTrigger>

<SelectContent className="rounded-2xl p-1.5">
  <SelectItem className="rounded-xl text-[13px] focus:bg-muted/50">
    …
  </SelectItem>
</SelectContent>
```

Правила:

- Триггер: **`h-9`**, `rounded-full`, `bg-muted/40`, **без border/shadow**
- Content: наследует примитив `bg-popover border-border/50 shadow-none`; на call-site только размер/паддинг (`rounded-2xl p-1.5`)
- Item: `rounded-xl`, focus/hover через `bg-muted/50` (не обязательно `bg-accent`, если это плодит ещё одну визуальную систему)
- **Не** перебивай surface классами `border-0` / `bg-background` / `shadow-*` / `ring-*`

---

## 6. Dropdown

Триггер = та же кнопка/чип, что Button secondary или icon ghost.

```tsx
<DropdownMenuTrigger asChild>
  <button
    type="button"
    className="inline-flex h-9 items-center gap-1.5 rounded-full border-none bg-muted/40 px-3 text-[13px] font-medium shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60"
  >
    Меню
  </button>
</DropdownMenuTrigger>

<DropdownMenuContent
  align="end"
  className="min-w-[12rem] rounded-2xl p-1.5"
>
  <DropdownMenuItem className="rounded-xl px-3 py-2 text-[13px] focus:bg-muted/50">
    Пункт
  </DropdownMenuItem>
  <DropdownMenuSeparator className="bg-border/50" />
  <DropdownMenuItem
    variant="destructive"
    className="rounded-xl px-3 py-2 text-[13px]"
  >
    Удалить
  </DropdownMenuItem>
</DropdownMenuContent>
```

Правила:

- Content = тот же floating surface, что и Dialog/Popover: `bg-popover` + `border-border/50` + `shadow-none` (уже в примитиве)
- Скругление панели `rounded-2xl`, пунктов `rounded-xl`
- Open-state триггера: `data-[state=open]:bg-muted/60`
- На call-site не ставь `border-0` / другой `bg-*` / `shadow-*` / `ring-*`

Ориентиры в репо: `studio-browse.tsx` (триггер `bg-muted/40`), `locale-switcher.tsx` (`rounded-2xl p-1.5`), `studio-prompt.tsx` (model menu).

---

## 7. Input / Textarea / search

```tsx
<input
  className="h-9 w-full rounded-full border-none bg-muted/40 px-3.5 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/20"
/>

<textarea
  className="min-h-[88px] w-full resize-none rounded-2xl border-none bg-transparent px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground/70"
/>
```

- Поля в студии: **без border**, без shadow
- Покой `bg-muted/30`–`/40`, фокус чуть плотнее (`/40`–`/50`) или подъём оболочки (`focus-within:bg-muted/30`)

---

## 8. Чипы / фильтры / сегменты

Как на studio home / browse:

```tsx
<button
  type="button"
  className={cn(
    "inline-flex h-8 items-center rounded-full px-2.5 text-[13px] font-medium transition-colors",
    active
      ? "bg-foreground text-background"
      : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  )}
>
  Фильтр
</button>
```

Активный = `bg-foreground text-background` (или `bg-primary text-primary-foreground`), не отдельный «синий с бордером».

---

## 9. Диалоги и меню-панели

Общая рамка: `border border-border/50 shadow-none`. Фон разный:

```
Dropdown / Select / Popover → bg-popover text-popover-foreground
Dialog                     → bg-background text-foreground
```

- Dialog оболочка: `rounded-3xl … p-0` (см. start-dialogs, org-dialogs, upgrade) — **без** `border-0` / `bg-popover`
- Dropdown / Popover: `rounded-2xl`
- Внутренние поля: `bg-muted/30` → `focus:bg-muted/40`
- CTA в футере: `h-10 rounded-full`
- Не добавляй `shadow-*` «для глубины»

Канон живёт в `components/ui/{dropdown-menu,select,popover,dialog}.tsx`.

---

## 10. Чеклист перед коммитом UI

1. Есть ли `shadow-*`? Убери.
2. Триггер/инпут/чип без border? Menu/popover — `border-border/50` + `bg-popover`; dialog — `border-border/50` + `bg-background`?
3. Высота действия — `h-9` / `h-10`?
4. Фон только из `background | foreground | primary | muted(/opacity) | popover | destructive/10`?
5. Нет ли третьей палитры (`#hex`, `land-*`, `input/30` dark-stack) рядом с `muted`?
6. Open/hover продолжают ту же лестницу `/40` → `/60`?
7. Call-site не перебивает surface (`border-0`, чужой `bg-*`, `ring-*`)?

---

## 11. Для агентов

При правках studio UI:

- Следуй этому файлу, а не дефолтам shadcn в `components/ui/*`, если они конфликтуют.
- Предпочитай переопределение `className` на месте; меняй примитив только если паттерн уже повторяется ≥3 раза.
- Не вводи новые variant-темы в `buttonVariants` без явного запроса.
- Копируй соседние контролы в том же экране (один визуальный язык на view).
