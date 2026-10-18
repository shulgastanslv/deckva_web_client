import {
  CleanArt,
  FormatsArt,
  FreeArt,
  SavedArt,
} from "@/components/landing/landing-art";
import {
  LandingGrid,
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
} from "@/components/landing/landing-shell";

export function FreeBlock() {
  return (
    <LandingSection id="free">
      <LandingHead
        title="Бесплатно ?"
        text="Да. Без плана, без пробного времени, без логотипа на обложке. Вы открываете студию и публикуете."
      />

      <LandingGrid className="md:grid-cols-12">
        <LandingLayer className="bg-white md:col-span-7">
          <LandingPad>
            <h3 className="mt-3 max-w-sm text-4xl font-extrabold tracking-tight text-land-ink">
              Откройте студию и начните
            </h3>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-land-ink/55">
              Холст и загрузка бесплатны, вы можете использовать его сколько угодно раз.
            </p>
            <div className="mt-5 flex justify-center">
              <FreeArt />
            </div>
          </LandingPad>
        </LandingLayer>

        <LandingLayer className="bg-land-ink text-white md:col-span-5">
          <LandingPad className="flex h-full flex-col justify-between">
            <p className="text-sm font-bold tracking-wide text-white/60">
              Цена
            </p>
            <p className="mt-6 text-7xl font-extrabold tracking-tight sm:text-8xl">
              $0
            </p>
            <div className="mt-8">
              <h3 className="text-3xl font-extrabold tracking-tight">
                Без подписки
              </h3>
              <p className="mt-2 max-w-xs text-base leading-relaxed text-white/70">
                Генерируйте, редактируйте и экспортируйте. Ничего не нужно обновлять.
              </p>
            </div>
          </LandingPad>
        </LandingLayer>

        <LandingLayer className="bg-land-blue md:col-span-7">
          <LandingPad>
            <p className="text-lg font-bold text-white">Форматы</p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
             Разные форматы для разных задач
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Один макет переключается для поста, квадрат, история или широкий фрейм.
            </p>
            <FormatsArt />
          </LandingPad>
        </LandingLayer>

        <LandingLayer className="bg-white md:col-span-5">
          <LandingPad>
            <p className="text-lg font-bold text-land-blue">Проекты</p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-land-ink">
              Карусель остается вашей
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/55">
              Войдите и слайды останутся. Закройте вкладку и вернитесь.
            </p>
            <SavedArt />
          </LandingPad>
        </LandingLayer>

        <LandingLayer className="bg-white text-land-ink md:col-span-12">
          <LandingPad>
            <div className="grid items-center gap-6 sm:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-lg font-bold text-land-blue">Экспорт</p>
                <h3 className="mt-2 text-4xl font-extrabold tracking-tight">
                  PNG и ZIP, без водяного знака
                </h3>
                <p className="mt-2 max-w-sm text-lg leading-relaxed text-land-ink/55">
                  Скачайте слайды как есть. Без логотипа студии на обложке.
                </p>
              </div>
              <CleanArt />
            </div>
          </LandingPad>
        </LandingLayer>
      </LandingGrid>
    </LandingSection>
  );
}
