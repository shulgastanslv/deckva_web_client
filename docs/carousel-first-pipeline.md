# Как работает генерация (carousel-first)

Главный результат продукта — **карусель**. Caption (текст) и palette (цвета) — необязательные шаги подготовки: они передают контент и цвета в генерацию слайдов, а не живут как равноправные «конечные» продукты.

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

Рабочие пути:

| Путь | Что происходит |
|------|----------------|
| **Прямой** | prompt → carousel |
| **Caption → carousel** | текст артефакта → `seedText` + короткий `topic` |
| **Palette → carousel** | цвета лочатся в редактор; topic из prompt/имени |
| **Caption → palette → carousel** | цепочка `parentId`: TEXT даёт caption, PALETTE — цвета |

## Пошаговый runtime

### 1. Старт в Studio (`/studio`)

- Дефолтный тип промпта: **Carousel**
- Порядок тайлов: Carousel → Caption → Palette → inserts
- Копирайт: «Make a carousel» / «Optionally draft caption or colors first»

Точки входа:

- промпт (`StudioPrompt` → `generateFromPrompt`)
- диалоги тайлов (carousel / caption / palette)
- CTA на страницах артефактов (**Make carousel**)

### 2. Create hook (`useStudioCreate`)

| Тип | Что делает |
|-----|------------|
| `text` | AI `/text` → `createTextArtifact` → `/studio/artifacts/:id` |
| `palette` | AI `/palette` → `createPaletteArtifact` → `/studio/artifacts/:id` |
| `carousel` | см. ниже |

Для carousel:

1. `resolveCarouselPipelineContext(...)` — подтягивает parent/grandparent
2. `topicForCarouselGeneration(ctx)` — если есть `seedText`, brief для AI обогащается caption
3. `createProject` + `linkCarouselArtifact({ parentId })`
4. В `sessionStorage` кладётся `StudioGenerateIntent` с полями:
   - `topic`, `seedText?`, `palette?`
   - `projectId`, ratio, slides, handle, cover, `parentArtifactId`
5. Редирект в `/studio/editor?project=…`

### 3. Resolve context (`resolve-pipeline-context.ts`)

При `parentArtifactId`:

- **TEXT** → `seedText` = тело caption; короткий topic из первой строки / title
- **PALETTE** → `palette` = AiPalette; если у палитры есть `parentId` на TEXT — caption берётся оттуда
- **CAROUSEL** → только topic из payload/prompt (редко)

Явно переданные `seedText` / `palette` из UI побеждают авторазбор.

### 4. Editor bootstrap (`studio-intent-bootstrap.tsx`)

Когда canvas готов и в storage лежит `type: "generate"` для этого `projectId`:

1. `POST /api/ai/generate` с телом:
   ```json
   {
     "topic": "...",
     "seedText": "...",
     "palette": { "name": "...", "bg": "#...", ... },
     "aspectRatio": "4:5",
     "slidesCount": 7,
     "language": "...",
     "handle": "...",
     "cover": "..."
   }
   ```
2. Слайды применяются через `applyPayload`
3. Палитра в store: **locked `intent.palette` > AI `result.palette`**
4. `saveProject` + сброс dirty

### 5. Upstream AI (`lib/ai/generate.ts`)

На AI-сервис уходит:

- `topic`
- при наличии caption: `seed_text` и `post_text` (оба = полный текст)
- `aspect_ratio`, `slides_count`, `language`, `handle`, `cover`

Если в интенте уже есть palette — ответная палитра AI игнорируется, используется locked.

## Что сохраняется в БД

| Шаг | Сущность | Связь |
|-----|----------|-------|
| Caption | `Artifact(kind=TEXT)` | опциональный `parentId` |
| Palette | `Artifact(kind=PALETTE)` | часто `parentId` → TEXT |
| Carousel | `Project` + `Artifact(kind=CAROUSEL)` | `parentId` → TEXT или PALETTE; `projectId` → project |

Линейка читается при следующем шаге через `getArtifactById` + walk parent.

## UI-гравитация к карусели

- Registry: у text/palette `nextSteps: ["carousel"]`, helpers тише
- `PipelineNextSteps`: primary **Make carousel**, secondary «Or prep first»
- На text/palette artifact pages явно сказано, что caption/цвета уходят в carousel

## Ключевые файлы

| Файл | Роль |
|------|------|
| `lib/studio/pipeline.ts` | правила продукта + enrichment topic |
| `lib/studio/resolve-pipeline-context.ts` | walk parent → seedText/palette |
| `lib/studio/generation/registry.ts` | kinds, next/helper, порядок |
| `lib/studio/pending-intent.ts` | sessionStorage intent |
| `lib/studio/start-blocks.ts` | тайлы create (carousel first) |
| `components/studio/lib/use-studio-create.ts` | entrypoints генерации |
| `components/studio/studio-intent-bootstrap.tsx` | apply в editor |
| `components/studio/pipeline/pipeline-next-steps.tsx` | CTA продолжения |
| `lib/ai/generate.ts` | upstream payload |
| `app/api/ai/generate/route.ts` | HTTP bridge |

## Как проверить

1. `/studio` — заголовок «Make a carousel», тип промпта Carousel, тайлы Carousel → Caption → Palette.
2. Caption → artifact → **Make carousel** — в запросе есть `seedText`.
3. Caption → Palette → Make carousel — цвета locked; caption подтягивается через grandparent.
4. Прямая генерация carousel без parent по-прежнему работает.
