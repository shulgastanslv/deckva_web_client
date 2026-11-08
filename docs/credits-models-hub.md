# Deckva AI Platform — планы, модели, кредиты, CORA

Продуктово-техническая спецификация: три тарифа, каталог моделей, выбор модели без локального хостинга LLM, кредитный хаб и планировщик генерации.

Ориентир по UX/экономике: [Lovart](https://www.lovart.ai/pricing) (кредиты + планы).  
Ориентир по агенту: Lovart MCoT (analyze → plan → render → edit) — у Deckva аналог называется **CORA**.

Стек вывода: всегда **редактируемый canvas-карусель**, не плоская картинка.  
LLM: только удалённо (OpenRouter и аналоги). На серверах Deckva **нет** весов моделей.

---

## 1. Аббревиатура планировщика: CORA

**CORA** — *Carousel Orchestration & Reasoning Agent*

Роль: «креативный директор» перед генерацией. Не рисует пиксели сам — **разбирает бриф, строит план объектов, раздаёт jobs моделям/tools, собирает canvas**.

| Буква | Смысл |
|---|---|
| **C**arousel | Целевой артефакт — карусель слайдов |
| **O**rchestration | Раздача задач разным моделям и tools |
| **R**easoning | Явный план (JSON), не one-shot prompt |
| **A**gent | Цикл: plan → execute → assemble → edit |

Параллель с Lovart MCoT:

| Lovart MCoT | Deckva CORA |
|---|---|
| Analyze brief + brand | Analyze topic + brand kit + ratio |
| Plan structured objects | Plan slides + layers (text/image) |
| Orchestrate image/video models | Orchestrate LLM + image tools |
| Editable ChatCanvas | Editable studio canvas / project |

---

## 2. Три плана

Валюта продукта: **кредит** (целое число). Цены — ориентир в **BYN** (калибровать под себестоимость OpenRouter).

| | **Free** | **Starter** | **Pro** |
|---|---|---|---|
| Цена | 0 | 15 BYN / мес | 39 BYN / мес |
| Год (−20%) | — | 12 BYN / мес | 31 BYN / мес |
| Кредиты плана / мес | 0 | **2 000** | **7 000** |
| Онбординг | **3 promo-генерации** (hosted) | — | — |
| Модели | только Economy | Economy + Balanced | все, включая Quality |
| Параллельные gen | 1 | 1 | 2 |
| Brand kits | — | 1 | 5 |
| Editable projects | 3 | безлимит | безлимит |
| Folders | нет | нет | да |
| Экспорт | PNG | PNG / ZIP | PNG / ZIP, приоритет |
| BYOK OpenRouter | нет | нет | да |
| Коммерция экспортов | личное | да | да |
| Скидка на top-up | — | — | −10% |

Правила подписки (как у Lovart):

- Кредиты плана живут **только текущий billing cycle**, **не переносятся**.
- При renew пул `plan` начисляется заново; остаток сгорает.
- Auto-renew; cancel → доступ до конца оплаченного периода.

### Пакеты кредитов (top-up)

| Пакет | Кредиты | Цена | TTL |
|---|---|---|---|
| Mini | 500 | 6 BYN | 366 дней |
| Plus | 2 000 | 20 BYN | 366 дней |
| Bulk | 8 000 | 70 BYN | 366 дней |

Порядок списания: `promo` → `plan` → `topup` (FIFO по `expiresAt` внутри bucket).

---

## 3. Каталог моделей

Модели **не хранятся** у Deckva. В каталоге — только метаданные + OpenRouter slug + цена в кредитах + мин. план.

### 3.1 LLM (карусель / текст / палитра)

| `modelId` | OpenRouter slug (пример) | Планы | Base credits / карусель (7 слайдов) | Назначение |
|---|---|---|---|---|
| `economy` | `google/gemini-2.5-flash` | Free, Starter, Pro | **40** | Онбординг, черновики |
| `balanced` | `openai/gpt-4.1-mini` | Starter, Pro | **70** | Дефолт Starter/Pro |
| `quality` | `anthropic/claude-sonnet-4` | Pro | **140** | Сильный JSON и копирайт |

Slug’и обновляются в админке без деплоя клиента. Клиент знает только `modelId`.

### 3.2 Image tools (всегда hosted / ваш ключ tool-API)

| `toolId` | Credits | Планы |
|---|---|---|
| `image.remove_bg` | 8 | Starter+ (Free — нет или 1 promo) |
| `image.upscale.2x` | 12 | Starter+ |
| `image.upscale.3x` | 18 | Pro |
| `image.upscale.4x` | 28 | Pro |
| `image.magic_layer` | 20 | Pro |

### 3.3 Формула стоимости карусели

```
credits = ceil(
  catalog[modelId].creditPerCarouselBase
  * (slides / 7)
  * qualityMult      // standard=1, detailed=1.25
  * speedMult        // fast=1 (v1 только fast)
)
```

`text.generate` ≈ `0.15 × creditPerCarouselBase`  
`palette.generate` ≈ `0.10 × creditPerCarouselBase`  
`regenerate_slide` ≈ `0.25 × creditPerCarouselBase`

Перед Generate — обязательный **quote** в UI: «≈ N кредитов».

---

## 4. Как выбирается модель

### 4.1 Приоритет выбора

1. **Явный выбор пользователя** в model picker (если модель доступна плану).
2. Иначе **дефолт плана**: Free → `economy`, Starter/Pro → `balanced`.
3. CORA в Thinking-режиме может **предложить** другую модель в plan (`recommendedModelId`), но не молча апгрейдить на платную без согласия (или без auto-approve в настройках Pro).
4. **BYOK (Pro):** пользователь выбирает slug из allowlist; LLM-кредиты = 0 (опционально 5 credits orchestration fee).

### 4.2 Доступ по плану

```
canUse(modelId, plan) =
  model.enabled
  && plan.rank >= model.minPlanRank
  && (model.byokOnly ? user.hasByok : true)
```

Недоступные модели в UI: видны серыми + «Нужен Pro».

### 4.3 Fast vs Thinking (режимы CORA)

| Режим | Поведение | Кредиты |
|---|---|---|
| **Fast** | Короткий plan → сразу execute на выбранной/дефолтной модели | 1× quote |
| **Thinking** | Полный CORA-plan (+ опционально 1 clarifying turn) → execute | quote plan (дешёвый economy) + quote render; или единый пакет «Thinking carousel» = 1.15× |

v1 можно упростить: Thinking не биллит отдельно, только дольше и стабильнее JSON.

---

## 5. Сервер выбора ИИ — без локальных моделей

### 5.1 Архитектура

```
[ Browser / Studio ]
        │  session cookie Deckva
        ▼
[ Deckva API ]  — auth, credits hold/spend, CORA, canvas save
        │  HTTPS + Bearer (platform или BYOK)
        ▼
[ OpenRouter ]  — реальные модели (не у вас)
```

На VM Deckva лежат только:

- `OPENROUTER_API_KEY` (platform) в secret store / env  
- зашифрованные BYOK-ключи пользователей  
- `AiModelCatalog` (slug, credits, minPlan)  
- промпты CORA + JSON schema карусели  

**Нет** GGUF/vLLM/Ollama в проде как source of truth.

### 5.2 Model Gateway (сервис или модуль)

Единая точка `lib/ai` / отдельный `deckva-ai` service:

```
POST /v1/complete
{
  "modelId": "balanced",          // наш id, не сырой slug
  "messages": [...],              // уже собранные CORA
  "responseFormat": "carousel_v1",
  "userId": "...",
  "byok": false
}
```

Gateway:

1. Резолвит `modelId` → OpenRouter slug из каталога.  
2. Подставляет ключ: platform **или** BYOK decrypt.  
3. Зовут `https://openrouter.ai/api/v1/chat/completions` (или `/responses`).  
4. Не логирует Authorization / тела ключей.  
5. Возвращает текст/JSON в Deckva для валидации.

Смена модели = правка строки в БД каталога, не деплой железа.

### 5.3 Почему так

- Не платите за GPU 24/7.  
- Пользователь/вы платите за токены OpenRouter.  
- Каталог и CORA — ваша IP; модели — commodity.

OAuth BYOK: [OpenRouter OAuth PKCE](https://openrouter.ai/docs/guides/overview/auth/oauth) — exchange `code` → key **на сервере**, ключ не в `localStorage`.

---

## 6. Система кредитов

### 6.1 Buckets

| Bucket | Источник | Срок |
|---|---|---|
| `promo` | 3 free hosted gen / акции | по правилам акции |
| `plan` | ежемесячный грант подписки | до конца cycle, без rollover |
| `topup` | купленные пакеты | 366 дней |

### 6.2 Ledger (обязателен)

Каждое движение — append-only:

- `grant_promo` / `grant_plan` / `purchase_pack`  
- `hold` → `spend` | `release` | `refund`  
- meta: `modelId`, `action`, `coraRunId`, `projectId`

Идемпотентность по `generationId`.  
Ошибка upstream / битый JSON после retries → **refund**.

### 6.3 Hold → Spend

```
quote → hold(N) → CORA run → success? capture spend : refund hold
```

### 6.4 Free = 3 генерации

Считаются успешные `carousel.generate` с platform key из bucket `promo`.  
После исчерпания — paywall: Starter / Pro / (на Pro) Connect OpenRouter.

---

## 7. Как работает CORA

### 7.1 Pipeline

```
1. INTAKE      brief (topic) + brand kit + ratio + model preference + mode
2. ANALYZE     intent, audience, language, slide count, constraints
3. PLAN        JSON CarouselPlan (slides → objects) + jobs[]
4. ROUTE       job → tool/model (catalog + plan ACL + credits)
5. EXECUTE     parallel workers (llm.copy, llm.structure, image.*)
6. ASSEMBLE    objects → canvas document / project slides
7. EDIT LOOP   user: «перепиши CTA на слайде 3» → partial CORA
```

Ключевой инвариант (как у Lovart): план в **объектах** (text/image/role), не в пикселях.  
Потом объект можно перегенерировать точечно.

### 7.2 CarouselPlan (схема)

```json
{
  "version": 1,
  "intent": "offer",
  "language": "ru",
  "ratio": "4:5",
  "slidesCount": 7,
  "recommendedModelId": "balanced",
  "brand": { "palette": ["#…"], "voice": "calm direct" },
  "slides": [
    {
      "index": 0,
      "role": "cover",
      "layout": "hero_text",
      "objects": [
        { "id": "t_hook", "type": "text", "role": "headline", "brief": "…" },
        { "id": "t_sub", "type": "text", "role": "sub", "brief": "…" },
        { "id": "img_cover", "type": "image", "role": "cover", "brief": "…" }
      ]
    }
  ],
  "jobs": [
    { "id": "j1", "tool": "llm.fill_texts", "slideIndexes": [0, 1, 2, 3, 4, 5, 6] },
    { "id": "j2", "tool": "llm.layout_canvas", "dependsOn": ["j1"] }
  ]
}
```

v1 workers можно схлопнуть: один LLM-job «fill + layout JSON» после PLAN.  
Позже — отдельные image jobs.

### 7.3 Промпты CORA (слои)

| Этап | Модель | Выход |
|---|---|---|
| ANALYZE+PLAN | дешёвая `economy` или выбранная | `CarouselPlan` only |
| EXECUTE layout | выбранная пользователем | canvas/slides JSON по schema Deckva |
| EDIT object | та же / cheaper | patch одного object id |

System prompt EXECUTE всегда включает: schema слайдов, запрет markdown-обёрток, язык брифа, brand locks.

### 7.4 Связь с текущим кодом

Уже есть задел: carousel-first pipeline (topic → seed text/palette → slides).  
CORA заменяет «скрытую кучу» на явный `CarouselPlan` + `jobs` + единый gateway моделей.

Файлы-ориентиры: `lib/studio/pipeline.ts`, `lib/studio/resolve-pipeline-context.ts`, `actions/ai.ts`, `lib/ai/*`.

---

## 8. UI (минимум)

1. Model picker рядом с промптом (chips: Economy / Balanced / Quality).  
2. Режим Fast | Thinking (CORA).  
3. Quote: «≈ 70 кредитов · осталось 1 930».  
4. Экран Billing: buckets, цикл плана, top-up, история ledger.  
5. Pro: «Подключить OpenRouter» (OAuth) → статус connected без показа ключа.

---

## 9. Данные (минимум таблиц)

- `PlanCatalog` — free/starter/pro  
- `CreditPackCatalog`  
- `UserSubscription` — planId, cycle  
- `CreditWallet` + `CreditLot` + `CreditLedgerEntry` + `CreditHold`  
- `AiModelCatalog` — modelId, openRouterSlug, credits, minPlan, enabled  
- `UserByokConnection` — ciphertext, keyHash, provider  
- `CoraRun` — plan JSON, jobs, status, spend refs  
- `GenerationJob` — action, modelId, projectId  

---

## 10. Этапы

**Phase A** — Free×3 + одна `economy` + ledger + gateway OpenRouter + Fast CORA (plan+execute упрощённо).  
**Phase B** — три плана, top-up, catalog 3 LLM, quote UI, Thinking.  
**Phase C** — BYOK OAuth, точечный edit-loop, image tools в jobs.

---

## 11. Критерии готовности

- [ ] Ни одна генерация без quote/hold (кроме явного BYOK path)  
- [ ] Модели только через OpenRouter slug из каталога  
- [ ] Веса моделей не на серверах Deckva  
- [ ] Ключи не в localStorage / не в API responses  
- [ ] CORA всегда выдаёт объекты → canvas, не «одну картинку поста»  
- [ ] Free упирается в paywall после 3 успешных carousel.generate  

---

## 12. Одной фразой

**Три плана продают кредиты; кредиты покупают вызовы моделей в OpenRouter; CORA превращает бриф в план слайдов и объектов и только потом вызывает модель — локально модели не хранятся.**
