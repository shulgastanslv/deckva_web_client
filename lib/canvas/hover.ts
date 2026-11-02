import { Canvas, FabricObject, Rect, TPointerEvent } from "fabric";

export class HoverManager {
  private canvas: Canvas;
  private hoverRect: Rect | null = null;
  private currentObj: FabricObject | null = null;
  private isEnabled = true;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.initListeners();
  }

  private initListeners(): void {
    // Отслеживаем движение мыши по холсту
    this.canvas.on("mouse:move", (opt) => {
      if (!this.isEnabled) return;
      
      // Если пользователь перетаскивает объект или выделяет что-то, скрываем hover-рамку
      if (this.canvas.isDrawingMode || this.canvas.getActiveObject()) {
        this.clearHover();
        return;
      }

      const pointer = this.canvas.getPointer(opt.e);
      const target = this.canvas.findTarget(opt.e);

      // Проверяем, есть ли объект под курсором и не служебный ли он (например, фон/сетка)
      if (target && target !== this.hoverRect && !target.excludeFromExport) {
        this.setHoverTarget(target);
      } else if (!target) {
        this.clearHover();
      }
    });

    // Когда мышь уходит за пределы холста
    this.canvas.on("mouse:out", () => {
      this.clearHover();
    });

    // Когда объект выбран, убираем hover-рамку, так как Fabric покажет стандартную рамку выделения
    this.canvas.on("selection:created", () => this.clearHover());
    this.canvas.on("selection:updated", () => this.clearHover());
  }

  private setHoverTarget(obj: FabricObject): void {
    if (this.currentObj === obj) return;
    this.currentObj = obj;

    // Вычисляем размеры и позицию объекта с учетом масштаба и поворота
    const boundingBox = obj.getBoundingRect();

    if (!this.hoverRect) {
      // Создаем стилизованную рамку в стиле Canva (тонкая синяя линия)
      this.hoverRect = new Rect({
        left: boundingBox.left,
        top: boundingBox.top,
        width: boundingBox.width,
        height: boundingBox.height,
        fill: "transparent",
        stroke: "#0066ff", // Фирменный синий цвет Canva
        strokeWidth: 1.5,
        strokeDashArray: undefined, // Можно сделать пунктиром [4, 4], если хочется
        selectable: false,
        evented: false,
        excludeFromExport: true,
        objectCaching: false,
      });
      this.canvas.add(this.hoverRect);
    } else {
      this.hoverRect.set({
        left: boundingBox.left,
        top: boundingBox.top,
        width: boundingBox.width,
        height: boundingBox.height,
        angle: obj.angle || 0,
        scaleX: 1,
        scaleY: 1,
      });
      this.hoverRect.setCoords();
      // Переносим рамку на самый верхний слой, чтобы она была поверх других объектов
      this.canvas.bringObjectToFront(this.hoverRect);
    }

    this.canvas.requestRenderAll();
  }

  public clearHover(): void {
    if (!this.hoverRect) return;
    this.canvas.remove(this.hoverRect);
    this.hoverRect = null;
    this.currentObj = null;
    this.canvas.requestRenderAll();
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
    this.clearHover();
  }

  public dispose(): void {
    this.clearHover();
    // События fabric удаляются автоматически при уничтожении canvas, 
    // но можно очистить ссылки
  }
}