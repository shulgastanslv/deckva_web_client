"use client";

import { PillSelect, PillSelectOption } from "@/components/ui/pill-select"; // Путь к вашему PillSelect
import { CANVAS_RATIOS, RatioKey } from "@/lib/types"; // Путь к вашему файлу с константами

interface RatioSelectProps {
  currentRatio: RatioKey;
  onRatioChange: (ratio: RatioKey) => void;
  disabled?: boolean;
}

export function RatioSelect({ currentRatio, onRatioChange, disabled }: RatioSelectProps) {
  // Превращаем CANVAS_RATIOS в список options для PillSelect с динамической иконкой
  const ratioOptions: PillSelectOption[] = Object.keys(CANVAS_RATIOS).map((key) => {
    const ratioKey = key as RatioKey;
    
    // Вычисляем примерные пропорции для визуальной иконки в селекте
    let iconStyle = "w-4 h-4";
    if (ratioKey === "16:9" || ratioKey === "3:1") iconStyle = "w-5 h-3";
    if (ratioKey === "9:16" || ratioKey === "1:2") iconStyle = "w-3 h-5";
    if (ratioKey === "4:3") iconStyle = "w-4 h-3";
    if (ratioKey === "3:2") iconStyle = "w-5 h-3.5";
    if (ratioKey === "4:5") iconStyle = "w-3.5 h-4";
    if (ratioKey === "5:4") iconStyle = "w-4 h-3.5";

    return {
      value: ratioKey,
      label: ratioKey,
      leading: (
        <span
          className={`inline-block rounded-[2px] border border-muted-foreground/60 bg-foreground/10 ${iconStyle}`}
        />
      ),
    };
  });

  return (
    <PillSelect
      label="Ratio"
      value={currentRatio}
      className="w-[150px]"
      onValueChange={(val) => onRatioChange(val as RatioKey)}
      options={ratioOptions}
      disabled={disabled}
      placeholder="Select ratio"
    />
  );
}