# CORA System

**CORA** — *Carousel Orchestration & Reasoning Agent*  
Система агентной генерации Deckva: сначала план объектов, потом вызов моделей, потом сборка в редактируемый canvas.

Связанные доки:

- Планы / кредиты / каталог моделей: [`credits-models-hub.md`](./credits-models-hub.md)
- Текущий carousel-first pipeline: [`carousel-first-pipeline.md`](./carousel-first-pipeline.md)

Аналог у Lovart: MCoT (analyze → plan → render → edit).  
У Deckva цель уже́же: **карусель + слои + бренд + экспорт**, не произвольный design/video suite.

---

## 1. Зачем CORA

One-shot `prompt → JSON слайдов` ломается на сложных брифах и не даёт точечный edit.

CORA вставляет явный слой рассуждения:

1. Понять бриф и ограничения  
2. Спланировать слайды как **набор объектов**  
3. Раздать jobs моделям/tools  
4. Собрать canvas  
5. Править объект/слайд без полной перегенерации  

Инвариант: на холст попадают **объекты с id и role**, не «одна картинка поста».

---

## 2. Расшифровка

| | Смысл |
|---|---|
| **C**arousel | Единственный primary output — карусель |
| **O**rchestration | Router jobs → LLM / image tools |
| **R**easoning | Обязательный `CarouselPlan` (JSON) |
| **A**gent | Цикл plan → execute → assemble → edit |

---

## 3. Высокоуровневый поток

```
┌─────────┐   ┌─────────┐   ┌──────┐   ┌───────┐   ┌─────────┐   ┌──────────┐
│ INTAKE  │──▶│ ANALYZE │──▶│ PLAN │──▶│ ROUTE │──▶│ EXECUTE │──▶│ ASSEMBLE │
└─────────┘   └─────────┘   └──────┘   └───────┘   └─────────┘   └────┬─────┘
                                                                       │
                                                              ┌────────▼────────┐
                                                              │ EDIT LOOP       │
                                                              │ (object / slide)│
                                                              └─────────────────┘
```

Все LLM-вызовы — через Model Gateway с **одним** `OPENROUTER_API_KEY` (см. credits hub). BYOK нет.

---

## 4. Режимы

| Режим | Когда | Поведение | Биллинг (ориентир) |
|---|---|---|---|
| **Fast** | дефолт онбординга | сжатый PLAN + сразу EXECUTE | 1× quote выбранной модели |
| **Thinking** | сложный бриф / бренд | полный PLAN, опционально 1 clarifying вопрос, потом EXECUTE | plan на economy (дешёвый) + execute quote; или пакет `1.15×` |

v1 можно стартовать только с **Fast**; Thinking — phase B.

---

## 5. Стадии подробно

### 5.1 INTAKE

Вход:

```ts
{
  topic: string;
  language?: string;          // иначе infer из topic
  ratio?: "4:5" | "1:1" | "9:16" | ...;
  slidesCount?: number;       // default 7, clamp 4–10
  modelId?: string;           // picker; иначе дефолт плана
  mode: "fast" | "thinking";
  brandKit?: { palette?, fonts?, voice?, logoAssetId? };
  seedText?: string;          // из caption pipeline
  parentArtifactId?: string;
  projectId?: string;         // regen into existing
}
```

Проверки до CORA: auth, plan ACL на `modelId`, **credits quote + hold**.

### 5.2 ANALYZE

Детерминированно + лёгкий LLM (или один промпт вместе с PLAN):

- `intent`: launch | howto | offer | story | checklist | announcement | other  
- `audience`, `tone`, `language`  
- `platformConstraints` из ratio  
- `hierarchy`: что важнее (hook → proof → cta)  
- нужен ли image job (если brand/cover brief)

Выход — блок внутри `CarouselPlan.analysis` (не отдельный user-facing артефакт в v1).

### 5.3 PLAN

Обязательный артефакт: **`CarouselPlan`**. Без валидного plan EXECUTE не стартует.

```json
{
  "version": 1,
  "coraRunId": "cor_…",
  "mode": "fast",
  "analysis": {
    "intent": "offer",
    "language": "ru",
    "audience": "small brand owners",
    "hierarchy": ["hook", "offer", "proof", "cta"]
  },
  "ratio": "4:5",
  "slidesCount": 7,
  "recommendedModelId": "claude-sonnet",
  "brand": {
    "palette": ["#14151c", "#2f5bff", "#f6f6f5"],
    "voice": "calm, direct"
  },
  "slides": [
    {
      "index": 0,
      "role": "cover",
      "layout": "hero_text",
      "objects": [
        {
          "id": "s0_headline",
          "type": "text",
          "role": "headline",
          "brief": "One-line hook about the offer"
        },
        {
          "id": "s0_sub",
          "type": "text",
          "role": "sub",
          "brief": "Who it is for"
        },
        {
          "id": "s0_cover",
          "type": "image",
          "role": "cover",
          "brief": "Optional cover mood; skip if no image tool"
        }
      ]
    }
  ],
  "jobs": [
    {
      "id": "j_fill",
      "tool": "llm.fill_and_layout",
      "modelId": "claude-sonnet",
      "dependsOn": [],
      "input": { "slideIndexes": [0, 1, 2, 3, 4, 5, 6] }
    }
  ]
}
```

Правила plan:

- У каждого object уникальный `id` в рамках run.  
- `role` из словаря: `headline | sub | body | cta | bullet | caption | cover | decor`.  
- `layout` из словаря: `hero_text | split | list | quote | cta_end | …`.  
- PLAN **не** генерирует финальный canvas JSON целиком в Thinking (только briefs); в Fast можно схлопнуть PLAN+EXECUTE в один LLM-вызов с двумя секциями, но наружу всё равно сохраняем plan.

### 5.4 ROUTE

По `jobs[]`:

1. Проверить `tool` в registry.  
2. Подставить `modelId` (user pick > job.recommended > plan default).  
3. Проверить ACL плана и что hold покрывает сумму job quotes (v1: один hold на весь run).  
4. Построить граф `dependsOn`, выполнить уровни параллельно.

### 5.5 EXECUTE — tools registry

| `tool` | Phase | Что делает |
|---|---|---|
| `llm.fill_and_layout` | A (MVP) | По plan заполняет тексты + возвращает canvas/slides JSON Deckva |
| `llm.fill_texts` | B | Только тексты объектов |
| `llm.layout_canvas` | B | Раскладка слоёв по layout+objects |
| `image.gen` | C | Обложка/арт по brief (если появится) |
| `image.remove_bg` | C | post-tool на asset |
| `image.upscale` | C | post-tool |
| `image.magic_layer` | C | post-tool |

MVP: один job `llm.fill_and_layout`.  
Позже дробим — тогда EDIT дешевле.

Каждый tool-вызов идёт в Gateway:

```
modelId → openRouterSlug → Bearer platform key → response
```

### 5.6 ASSEMBLE

1. Валидация schema (`carousel_v1` / canvas document).  
2. Normalize (как сейчас `normalizeDocument`).  
3. Создать/обновить project + slides + thumbnails pipeline.  
4. Привязать `coraRunId` к project / generation job.  
5. `hold` → `spend` (или refund при фейле).

### 5.7 EDIT LOOP

Примеры команд UI / chat:

- «Перепиши headline на слайде 1»  
- «Сделай CTA короче»  
- «Смени тон на более жёсткий на всех слайдах»  

Поток:

```
user edit intent
  → partial PLAN (только затронутые object ids)
  → EXECUTE tool на subset
  → patch document
  → spend меньший quote (regenerate_slide / object)
```

Без CORA-id объектов точечный edit невозможен — поэтому plan обязателен даже в Fast.

---

## 6. Связь с carousel-first

Текущий pipeline (caption → palette → carousel) **не заменяется**, а становится входом в INTAKE:

| Сейчас | В CORA |
|---|---|
| `seedText` из TEXT artifact | `intake.seedText` → ANALYZE/PLAN как source copy |
| locked `palette` | `intake.brandKit.palette` → hard constraint в plan + execute prompt |
| `topicForCarouselGeneration` | часть ANALYZE |
| один `generateCarousel` action | `cora.run` Fast = plan+execute; снаружи тот же UX «Make carousel» |

Файлы-зацепки:

| Файл | Роль после CORA |
|---|---|
| `lib/studio/pipeline.ts` | enrichment topic остаётся |
| `lib/studio/resolve-pipeline-context.ts` | кормит INTAKE |
| `actions/ai.ts` / `lib/ai/*` | Gateway + CORA stages |
| `use-studio-create.ts` | `runCora({ mode: "fast" })` |
| `studio-intent-bootstrap.tsx` | применяет assemble к editor |

---

## 7. Промпты (слои)

Держать отдельно, версионировать в `lib/cora/prompts/`:

| Prompt | Модель | Output |
|---|---|---|
| `analyze_plan_system` | economy или выбранная | `CarouselPlan` JSON only |
| `execute_layout_system` | выбранная пользователем | canvas/slides schema Deckva |
| `edit_object_system` | cheaper/same | patch `{ objectId, fields }` |

Жёсткие правила во всех system prompts:

- Только JSON, без markdown fences  
- Язык = язык брифа  
- Brand palette/fonts — не нарушать  
- Не выдумывать URL картинок; image objects без asset → placeholder / skip  
- Соблюдать `slidesCount` и ratio  

---

## 8. Данные

```
CoraRun
  id, userId, projectId?
  mode, status: queued|planning|executing|assembling|done|failed
  intake JSON
  plan JSON          // CarouselPlan
  modelId
  holdId, spendLedgerIds[]
  error?
  createdAt, finishedAt

CoraJob
  id, coraRunId
  tool, modelId
  dependsOn[]
  status, attempt
  requestMeta, responseMeta  // без секретов
  creditsQuoted, creditsSpent
```

---

## 9. Ошибки и деньги

| Событие | Действие |
|---|---|
| Plan JSON invalid | retry PLAN ≤2; иначе fail + **полный refund hold** |
| Execute schema invalid | retry EXECUTE ≤2 с repair prompt; иначе refund |
| OpenRouter 429/5xx | backoff; затем fail + refund |
| User cancel до EXECUTE | release hold |
| «Не нравится результат» | **не** refund (продуктовое правило) |

---

## 10. UI поверх CORA

1. Промпт + model picker + Fast/Thinking.  
2. Во время Thinking: короткий статус «CORA: plan → slides».  
3. Опционально показать plan (роли слайдов) до execute — phase B.  
4. В editor: «Regenerate with CORA» на слайд/объект.  
5. Credits quote рядом с кнопкой.

---

## 11. MVP → рост

### Phase A — CORA Fast
- INTAKE + PLAN+EXECUTE в 1–2 LLM calls  
- Сохраняем `CarouselPlan` с object ids  
- Assemble в project  
- Hold/spend  

### Phase B — Thinking + edit
- Полный plan, clarifying question  
- `regenerate_slide` / object patch  
- UI превью плана  

### Phase C — orchestration
- Отдельные text/layout/image jobs  
- Image tools в graph  
- Параллельный ROUTE  

---

## 12. Анти-паттерны

- Прямой `prompt → image of a carousel` без объектов  
- Plan только в chain-of-thought тексте модели без JSON schema  
- Разные несовместимые schema на каждую модель без нормализации  
- Хранить ключи пользователей / звать OpenRouter с браузера  
- Списывать кредиты до успешного assemble без refund path  

---

## 13. Критерии готовности CORA

- [ ] Каждый successful run имеет сохранённый `CarouselPlan`  
- [ ] Каждый text layer на canvas трассируется к `object.id`  
- [ ] Fast path создаёт editable project < целевого SLA  
- [ ] Fail upstream → refund  
- [ ] Caption/palette pipeline кормит INTAKE без регрессий  
- [ ] Смена модели = другой slug в каталоге, тот же CORA contract  

---

## Одной фразой

**CORA — это не модель, а оркестратор: бриф → план объектов карусели → вызов OpenRouter → сборка в canvas Deckva с возможностью точечного edit.**
