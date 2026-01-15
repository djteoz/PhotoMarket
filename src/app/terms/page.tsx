import { Metadata } from "next";
import { FileText, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Пользовательское соглашение — PhotoMarket",
  description: "Пользовательское соглашение сервиса PhotoMarket",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Правовая информация</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Пользовательское соглашение
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                1. Общие положения
              </h2>
              <p className="text-muted-foreground">
                Настоящее Пользовательское соглашение (далее — Соглашение)
                регулирует отношения между владельцем сайта (далее —
                Администрация) и пользователем сайта (далее — Пользователь).
                Используя данный сайт, вы соглашаетесь с условиями настоящего
                Соглашения.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                2. Регистрация на сайте
              </h2>
              <p className="text-muted-foreground">
                Для доступа к некоторым функциям сайта может потребоваться
                регистрация. Пользователь обязуется предоставить достоверную
                информацию при регистрации и поддерживать её в актуальном
                состоянии.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                3. Бронирование студий
              </h2>
              <p className="text-muted-foreground">
                Сайт предоставляет информационные услуги по поиску и
                бронированию фотостудий. Администрация не несет ответственности
                за качество услуг, предоставляемых владельцами студий. Все
                финансовые расчеты производятся непосредственно между
                Пользователем и Владельцем студии, если не указано иное.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Контент</h2>
              <p className="text-muted-foreground">
                Пользователи могут загружать фотографии и оставлять отзывы.
                Запрещается размещение контента, нарушающего законодательство
                РФ, авторские права или оскорбляющего других пользователей.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                5. Изменение условий
              </h2>
              <p className="text-muted-foreground">
                Администрация оставляет за собой право изменять условия
                настоящего Соглашения в любое время без предварительного
                уведомления. Новая редакция Соглашения вступает в силу с момента
                ее размещения на сайте.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
