# Как работает генерация (carousel-first)

Главный результат продукта — **карусель**. Caption (текст) и palette (цвета) — необязательные шаги подготовки: они передают контент и цвета в генерацию слайдов.

> На ветке `fix/global` AI вызывается через **Server Actions** (`actions/ai.ts`), не через `/api/ai/*`.

## Модель

```
                    ┌─────────────┐
                    │  Carousel   │  ← основной результат
                    └──────▲──────┘
           seedText /      │      locked palette
           topic           │
        ┌──────────┐       │       ┌──────────┐
        │  Caption │───────┴───────│ Palette  │
        └────▲─────┘               └────▲─────┘
             │  optional prep           │
             └──────────┬───────────────┘
                        │
                   user prompt
```

| Путь | Что происходит |
|------|----------------|
| **Прямой** | prompt → carousel |
| **Caption → carousel** | текст артефакта → `seedText` + короткий `topic` |
| **Palette → carousel** | цвета лочатся в редактор; topic из prompt/имени |
| **Caption → palette → carousel** | цепочка `parentId`: TEXT даёт caption, PALETTE — цвета |

## Runtime (поверх fix/global)

1. **Studio home** — дефолт Carousel; тайлы Carousel → Caption → Palette.
2. **`useStudioCreate.generateCarousel`** — `resolveCarouselPipelineContext` → `topicForCarouselGeneration` → project + artifact `parentId` → intent в sessionStorage (`seedText?`, `palette?`).
3. **`StudioIntentBootstrap`** — `generateCarousel` из `@/actions/ai` с `seedText` / `palette`; locked palette побеждает AI palette.
4. **`generateCarouselUpstream`** — в AI уходит `seed_text` / `post_text` при наличии caption.

## Ключевые файлы

| Файл | Роль |
|------|------|
| `lib/studio/pipeline.ts` | правила + enrichment topic |
| `lib/studio/resolve-pipeline-context.ts` | walk parent → seedText/palette |
| `lib/studio/generation/registry.ts` | kinds / next / helper (uses `GenerationKind`) |
| `lib/studio/pending-intent.ts` | sessionStorage intent |
| `components/studio/lib/use-studio-create.ts` | entrypoints |
| `components/studio/studio-intent-bootstrap.tsx` | apply через Server Action |
| `actions/ai.ts` | bridge к upstream |
| `lib/ai/generate.ts` | upstream payload |

## Проверка

1. `/studio` — «Make a carousel», тип Carousel.
2. Caption → Make carousel — в action уходит `seedText`.
3. Caption → Palette → carousel — palette locked; caption из grandparent.
4. Прямой carousel без parent работает.
