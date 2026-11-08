# Deckva AI Platform — планы, модели, кредиты, CORA

Продуктово-техническая спецификация: три тарифа, каталог популярных моделей через **один ключ OpenRouter в env**, кредитный хаб и планировщик **CORA**.

Ориентир: [Lovart pricing](https://www.lovart.ai/pricing) (кредиты + планы), Lovart MCoT → у Deckva **CORA**.  
Ранги моделей: [OpenRouter Rankings](https://openrouter.ai/rankings) (usage через Nov 2026).  
Полная спецификация агента: [`cora-system.md`](./cora-system.md).

**Принцип v1:** пользователи покупают планы/кредиты у Deckva; все LLM-вызовы идут с `OPENROUTER_API_KEY` на сервере.  
**BYOK нет.** Ключи пользователей не храним. Локальных весов моделей нет.

---

## 1. CORA — кратко

**CORA** — *Carousel Orchestration & Reasoning Agent*  
Поток: brief → ANALYZE → PLAN → ROUTE → EXECUTE → ASSEMBLE → EDIT LOOP.  
План в **объектах** (text/image/role) → редактируемый canvas. Детали — в [`cora-system.md`](./cora-system.md).

---

## 2. Три плана

Валюта: **кредит**. Цены — ориентир **BYN**.

| | **Free** | **Starter** | **Pro** |
|---|---|---|---|
| Цена | 0 | 15 BYN / мес | 39 BYN / мес |
| Год (−20%) | — | 12 BYN / мес | 31 BYN / мес |
| Кредиты / мес | 0 | **2 000** | **7 000** |
| Онбординг | **3 promo** hosted-генерации | — | — |
| Доступ к моделям | только tier **Economy** | **весь каталог** | **весь каталог** |
| Параллельные gen | 1 | 1 | 2 |
| Brand kits | — | 1 | 5 |
| Editable projects | 3 | безлимит | безлимит |
| Folders | нет | нет | да |
| Экспорт | PNG | PNG / ZIP | PNG / ZIP + приоритет |
| Коммерция | личное | да | да |
| Скидка top-up | — | — | −10% |

- Кредиты плана: на billing cycle, **без rollover**.  
- Top-up пакеты: TTL **366 дней**.  
- Списание: `promo` → `plan` → `topup`.

### Top-up

| Пакет | Кредиты | Цена |
|---|---|---|
| Mini | 500 | 6 BYN |
| Plus | 2 000 | 20 BYN |
| Bulk | 8 000 | 70 BYN |

---

## 3. Модели: один аккаунт OpenRouter, без локального хостинга

```
Studio → Deckva API (credits + CORA)
              → OPENROUTER_API_KEY (env)
              → OpenRouter → модель
```

На сервере Deckva только:

- `OPENROUTER_API_KEY`
- таблица `AiModelCatalog` (slug, tier, credits, enabled)
- промпты CORA + schema карусели

Веса моделей / Ollama / vLLM в проде **не используются**.

### 3.1 Политика каталога «все популярные и последние»

1. Стартовый whitelist ниже — модели major labs + топ OpenRouter usage.  
2. Раз в неделю (или по webhook/cron) **sync** с OpenRouter: новые flagship/flash от OpenAI, Anthropic, Google, DeepSeek, Qwen, xAI, Moonshot, Mistral, Meta, Z.ai, MiniMax и т.д. попадают в каталог как `enabled=true` после smoke-теста JSON schema.  
3. Пользователь в UI видит **все enabled** модели своего плана (Free — только Economy).  
4. Сырой OpenRouter slug клиенту не обязателен — показываем displayName; для power-users можно показать slug.  
5. Выключение модели = `enabled=false` в БД, без деплоя.

Smoke-тест: один `carousel.generate` на фикстурном брифе → валидный JSON → модель остаётся в каталоге.

### 3.2 Стартовый каталог (launch)

Цены в кредитах — **за карусель из 7 слайдов** (base).  
Формула: `ceil(base * slides/7 * qualityMult)`.

#### Tier Economy — дешёвые / flash (Free + все планы)

| `modelId` | OpenRouter slug (ориентир) | Base credits | Заметка |
|---|---|---|---|
| `deepseek-v4-flash` | `deepseek/deepseek-v4.1-flash` | 35 | топ usage OR |
| `glm-flash` | `z-ai/glm-5.3-flash` | 35 | топ usage OR |
| `gemini-flash` | `google/gemini-2.5-flash` / `gemini-3.1-flash-lite` | 40 | Google flash |
| `gpt-mini` | `openai/gpt-4o-mini` / актуальный mini/luna-lite | 45 | OpenAI mini |
| `claude-haiku` | `anthropic/claude-haiku-4.5` (или текущий Haiku) | 50 | быстрый Claude |
| `qwen-flash` | `qwen/qwen3.6-flash` | 35 | Qwen flash |
| `minimax-flash` | `minimax/minimax-m3.1-flash` | 35 | MiniMax flash |
| `llama-maverick` | `meta-llama/llama-4-maverick` | 40 | Meta |

Дефолт Free / promo: `deepseek-v4-flash` или `gemini-flash` (что стабильнее на schema).

#### Tier Standard — основной объём (Starter + Pro)

| `modelId` | OpenRouter slug (ориентир) | Base credits |
|---|---|---|
| `gpt-standard` | `openai/gpt-4.1` / `openai/gpt-5` / актуальный mid | 70 |
| `gpt-luna` | `openai/gpt-6-luna` (текущий mid-flagship OR) | 80 |
| `claude-sonnet` | `anthropic/claude-sonnet-4.5` / `claude-sonnet-5` | 90 |
| `gemini-pro` | `google/gemini-2.5-pro` / `gemini-3.1-pro` | 85 |
| `deepseek-pro` | `deepseek/deepseek-v4-pro` / chat flagship | 55 |
| `glm-standard` | `z-ai/glm-5.3` | 55 |
| `kimi` | `moonshotai/kimi-k3.1-pro` / Kimi latest | 75 |
| `grok` | `x-ai/grok-4` / latest Grok | 80 |
| `mistral-medium` | `mistralai/mistral-medium-latest` | 65 |
| `qwen-plus` | `qwen/qwen3.5-plus` / Max mid | 60 |
| `step-preview` | `stepfun/step-5-preview` | 55 |
| `hy` | `tencent/hy4` | 50 |

Дефолт Starter/Pro UI: `claude-sonnet` или `gpt-standard` (A/B по качеству JSON).

#### Tier Premium — самые сильные (Starter + Pro, дороже в кредитах)

| `modelId` | OpenRouter slug (ориентир) | Base credits |
|---|---|---|
| `claude-opus` | `anthropic/claude-opus-5.5` / Opus latest | 160 |
| `gpt-pro` | `openai/gpt-5.5-pro` / top OpenAI | 180 |
| `gemini-ultra` | актуальный Google Pro/Ultra на OR | 150 |
| `kimi-pro-max` | top Moonshot на OR | 140 |

> Slug’и в таблице — **ориентиры на момент спецификации**. Источник истины — `AiModelCatalog.openRouterSlug` после sync с [OpenRouter](https://openrouter.ai/models). При выходе GPT/Claude/Gemini next — добавляем строку, не ждём релиза приложения.

### 3.3 Image tools (не LLM; ваш tool backend)

| tool | Credits | Free | Starter | Pro |
|---|---|---|---|---|
| `remove_bg` | 8 | — | ✓ | ✓ |
| `upscale.2x` | 12 | — | ✓ | ✓ |
| `upscale.3x` | 18 | — | — | ✓ |
| `upscale.4x` | 28 | — | — | ✓ |
| `magic_layer` | 20 | — | — | ✓ |

### 3.4 Как пользователь выбирает модель

1. Model picker в studio (группировка Economy / Standard / Premium).  
2. Если не выбрал — дефолт плана.  
3. CORA Thinking может **рекомендовать** модель в plan; смена только с подтверждения или если включён «auto-pick».  
4. Недоступные Free-модели: lock + «Нужен Starter».  
5. Перед Generate — **quote** в кредитах для `(action, modelId, slides)`.

---

## 4. Кредиты (без BYOK)

### Buckets

| Bucket | Источник | Срок |
|---|---|---|
| `promo` | 3 free gen | акция |
| `plan` | подписка | до конца cycle |
| `topup` | пакеты | 366 дней |

### Поток

```
quote → hold → CORA + OpenRouter(platform key) → spend | refund
```

Ledger append-only; идемпотентность по `generationId`.  
5xx / invalid JSON после retries → refund.

Маржа: `creditPrice − openRouterTokenCost`. Алерты burn по platform key / день.

---

## 5. Model Gateway (прослойка)

```
POST /internal/ai/complete
{ modelId, messages, responseFormat: "carousel_v1", userId, coraRunId }
```

1. ACL плана + credits hold уже проверены выше.  
2. `modelId` → slug из каталога.  
3. `Authorization: Bearer $OPENROUTER_API_KEY`.  
4. Ответ → валидатор schema → canvas.  
5. Ключ никогда не в браузере и не в логах.

Отдельный сервис `deckva-ai` опционален; на старте достаточно модуля `lib/ai` + env.

---

## 6. CORA — детали

```
INTAKE → ANALYZE → PLAN(CarouselPlan JSON) → ROUTE(jobs)
      → EXECUTE(workers через Gateway) → ASSEMBLE(canvas)
      → EDIT(partial regen object/slide)
```

Режимы:

- **Fast** — короткий plan, сразу execute.  
- **Thinking** — полный plan (+ optional clarify), затем execute.

`CarouselPlan` содержит slides[].objects[] и jobs[]; EXECUTE заполняет контент выбранной моделью.

Связь с кодом: `lib/studio/pipeline.ts`, `actions/ai.ts`, `lib/ai/*`.

---

## 7. UI

- Picker моделей (все enabled для плана)  
- Fast | Thinking  
- Quote кредитов  
- Billing: баланс buckets, top-up, история  
- **Нет** экрана «подключить свой OpenRouter»

---

## 8. Данные

- `PlanCatalog`, `CreditPackCatalog`, `UserSubscription`  
- `CreditWallet`, `CreditLot`, `CreditLedgerEntry`, `CreditHold`  
- `AiModelCatalog` (modelId, openRouterSlug, tier, baseCredits, minPlan, enabled, sort)  
- `CoraRun`, `GenerationJob`  

**Нет** `UserByokConnection`.

---

## 9. Этапы

**A** — env OpenRouter + promo×3 + Economy subset + ledger + Fast CORA.  
**B** — Starter/Pro, полный стартовый каталог, top-up, quote UI, Thinking.  
**C** — auto-sync новых моделей с OpenRouter + smoke, edit-loop CORA, image tools в jobs.

---

## 10. Готовность

- [ ] Только `OPENROUTER_API_KEY`, без user keys  
- [ ] Нет локальных весов моделей  
- [ ] Каталог покрывает popular/latest major labs + топ OR  
- [ ] Free: 3 gen + Economy; Starter/Pro: весь каталог  
- [ ] Quote → hold → spend/refund  
- [ ] CORA → объекты → canvas  

---

## Одной фразой

**Люди платят кредиты Deckva; Deckva гоняет CORA и все популярные модели через свой OpenRouter-аккаунт — без BYOK и без хостинга моделей.**
