# Правки холста и роли объектов

Холст по-прежнему рисует Fabric. Слой ниже — про то, как сохранить изменение и как понять, что за объект на слайде. Отдельный редактор (tldraw, Konva) для этого не подключён: в зависимостях они есть, код их не вызывает.

## Как было

Два независимых механизма.

**Роли** лежали строками `swibpRole` и проверялись в нескольких местах своими списками:

- `chrome.ts` знал только `number`, `handle`, `swipe` и копировал их на остальные слайды.
- `insights.ts` держал свой набор `number`, `handle`, `swipe`, `cue`, `social`, `cta` и не считал такой текст текстом слайда.
- Двойной клик в `manager.ts` был цепочкой `if (role === "split")` / `frame`.
- Сетка и слои отдельно сравнивали роль с `"split"`, чтобы не двигать закреплённый блок.

Новая роль означала найти все эти списки и дописать строку. Пропущенный список молча ломал поведение.

**Сохранение** шло через событие Fabric `object:modified`. Это событие Fabric шлёт, когда человек отпустил объект после drag, scale или rotate. Панель свойств делала то же самое вручную:

```ts
selectedObject.scaleToWidth(val);
canvas.requestRenderAll();
canvas.fire("object:modified");
```

У каждого поля был свой метод: ширина, высота, радиус картинки, тень, замок, смена `src`. Одни вызывали `fire`, другие `manager.commit()`, третьи `updateActiveObject`. Забытый `fire` не попадал в undo и не обновлял плавающую панель и Auto Flow.

`object:added` / `object:removed` по-прежнему сами зовут `commit()`. Это нормальный путь для «положили объект» и «удалили объект». Ломался путь «объект уже есть, у него поменялись свойства, Fabric об этом не знает».

## Как теперь

Три файла.

| Файл | Задача |
| --- | --- |
| `lib/canvas/roles.ts` | Единственный список ролей и флаги поведения |
| `lib/canvas/edits.ts` | Запись свойств, которые не являются простым `object.set` |
| `CanvasManager.edit()` | Один шаг истории и событие `edit` |

Событие менеджера `edit` — это «свойства поменяли из кода». `object:modified` остаётся только для жеста указателем.

### Какой метод звать

| Ситуация | Метод |
| --- | --- |
| Обычное свойство Fabric: заливка, шрифт, текст, обводка | `manager.updateActiveObject(patch)` или `updateSelected` из `useSelectedObject` |
| Ширина, высота, радиус, тень, замок | функция из `lib/canvas/edits.ts` внутри `manager.edit()` |
| Несколько синхронных шагов одним undo, отмена через `return false` | `manager.transact()` |
| Асинхронная пачка (смена `src`, инструменты картинки) | `manager.runBatched()` |
| Объект добавили или удалили через `canvas.add` / `canvas.remove` | ничего: `object:added` / `object:removed` уже пишут историю |
| Объект уже на холсте, Fabric событие не шлёт | `edited(target)` внутри `ObjectFactory` |
| Фон, порядок слоёв и прочие мутации вне `edit` / `transact` | после изменения `manager.commit()` |

`edit` и `runBatched` сами вызывают `commit()`, шлют `edit` и обновляют `selection`. Повторный `commit()` внутри них не нужен: на время колбэка менеджер глушит промежуточные записи.

`transact` шлёт `selection` и `change`, но не `edit`. Его слушатели — жест группировки и вставка стиля, где Fabric и так шлёт свои события выделения.

## Роли

Каталог:

```ts
export const ROLE_CATALOG = {
  number: { chrome: true, skipInsights: true },
  handle: { chrome: true, skipInsights: true },
  swipe: { chrome: true, skipInsights: true },
  cue: { skipInsights: true },
  social: { skipInsights: true },
  cta: { skipInsights: true },
  split: { pinned: true, activate: "split" },
  frame: { activate: "frame" },
  arrow: {},
  progress: {},
  caption: {},
  code: {},
} as const;
```

Флаги:

| Флаг | Эффект |
| --- | --- |
| `chrome` | Объект копируется на остальные слайды. Сейчас это счётчик, автор и swipe. |
| `skipInsights` | Текст с этой ролью не считается текстом слайда. |
| `pinned` | Объект не двигается смарт-гайдами и в слоях остаётся закреплённым по позиции. |
| `activate` | Двойной клик. `"split"` открывает файл в сплит, `"frame"` — в экран устройства. Роль без `activate` по двойному клику заполняется картинкой, если фигура это умеет. |

Читать роль так:

```ts
import { hasRole, roleOf, isPinnedRole, activateFor } from "@/lib/canvas/roles";

hasRole(obj, "code");
roleOf(obj);          // ObjectRole | null, чужая строка даёт null
isPinnedRole(obj);
activateFor(roleOf(obj));
```

`chromeRole` по-прежнему экспортируется из `lib/canvas/chrome.ts`. Он возвращает роль только если у неё стоит `chrome`.

Назначить роль при создании объекта — `tagRole` в `ObjectFactory`. Тип `ObjectRole` не даст записать роль, которой нет в каталоге:

```ts
this.tagRole(text, "number", { swibpNumberStyle: style, swibpSlot: "text" });
```

Если объект с этой ролью уже был и его надо обновить на месте, после `set` позови `this.edited(existing)`. Так номер слайда и пересобранный экран устройства попадают в историю и в событие `edit` с этим объектом, а не через `canvas.fire`.

### Новая роль

1. Добавь ключ в `ROLE_CATALOG` и нужные флаги. Отдельный `Set` в другом файле не заводи.
2. Создавай объект через `tagRole`.
3. Если роль одна на слайд, перед добавлением вызови `removeRole("твоя-роль")`.
4. Если двойной клик делает что-то своё, расширь `RoleActivate` и ветку в `bindCanvasEvents`. Пока там только `split` и `frame`.
5. Поведение хрома, инсайтов и пина подхватится само по флагу.

`cue` и `cta` в каталоге остаются, чтобы старые слайды читались так же: `cue` снимается вместе со swipe, `cta` по-прежнему не идёт в инсайты.

## Запись свойств

Простое поле:

```ts
updateSelected({ fontSize: 48 } as Partial<FabricObject>);
```

`updateActiveObject` сам рисует, пишет undo и шлёт `selection`. Для текста, иконки и маски логика уже внутри него. Событие `edit` этот путь не шлёт: панель сама обновляет свой локальный стейт.

Поле с особой записью:

```ts
manager.edit(() => scaleToMeasuredWidth(selectedObject, width));
```

Готовые функции в `lib/canvas/edits.ts`:

| Функция | Что делает |
| --- | --- |
| `scaleToMeasuredWidth` / `scaleToMeasuredHeight` | Видимый размер. `scaleToWidth` / `scaleToHeight` не шлют `object:modified`. |
| `setCornerRadius` | У прямоугольника это `rx`/`ry`. У картинки — клип по центру. Прямоугольник в панели по-прежнему идёт через `updateSelected`, картинка — через `edit`. |
| `paintShadow` | Включает, меняет или снимает тень у всех выделенных объектов. |
| `setMovementLock` | Замок движения, поворота, масштаба и ручек. |

Новое такое поле: функция в `edits.ts`, вызов внутри `manager.edit`. Рендер, undo и `edit` менеджер сделает сам.

Смена картинки уже собрана в `replaceImageSource` из `lib/image/apply-deckva-tools.ts`. Она зовёт `runBatched`, поэтому второй `commit` и `fire` не нужны:

```ts
await replaceImageSource(manager, image, nextSrc);
```

## События, на которые можно подписаться

`manager.on` возвращает функцию отписки.

| Событие | Когда | Payload |
| --- | --- | --- |
| `change` | Документ записан в историю, его надо сохранить | `CanvasState` |
| `load` | Слайд целиком заменён через `loadState` | `CanvasState` |
| `selection` | Сменилось выделение | `FabricObject \| null` |
| `edit` | Свойства поменяли из кода (`edit`, `runBatched`, `edited`) | Объект правки или текущее выделение |

Жесты указателя слушай на `manager.canvas`: `object:moving`, `object:scaling`, `object:rotating`, `object:modified`, `selection:*`. Плавающая панель и Auto Flow слушают и эти события, и `edit`, поэтому программная смена ширины двигает панель и может предложить перенос на следующий слайд.

Так подписываются:

```ts
const unsubscribe = manager.on("edit", (target) => {
  // target — объект, который поменяли
});
```

## Чего больше не делать

Не сохраняй документ через `canvas.fire("object:modified")`. Событие остаётся сигналом «пользователь отпустил объект». Поддельный `fire` без `target` раньше случайно вызывал `commit()` и обновлял слушателей.

Не заводи новый список ролей рядом с каталогом. Проверка `obj.swibpRole === "split"` снова разъедется с `isPinnedRole` и двойным кликом.

Не вызывай `commit()` в конце `edit`, `transact` и `runBatched`. Они уже пишут один шаг истории. `commit()` нужен, когда мутация прошла мимо этих методов и Fabric её не заметил.
