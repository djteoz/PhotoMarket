import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">О нас</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Кто мы</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            PhotoMarket — это современная платформа для поиска и бронирования
            фотостудий. Мы объединяем владельцев студий и фотографов, делая
            процесс аренды простым, прозрачным и удобным для всех.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Для фотографов</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Удобный поиск по параметрам и карте</li>
                <li>Актуальное расписание и мгновенное бронирование</li>
                <li>Честные отзывы и рейтинги</li>
                <li>Безопасная оплата</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Для владельцев студий</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Управление бронированиями в одном месте</li>
                <li>Привлечение новых клиентов</li>
                <li>Гибкая настройка цен и расписания</li>
                <li>Аналитика и статистика</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Наша миссия</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Мы стремимся развивать творческое сообщество, предоставляя лучшие
            инструменты для организации съемок. Наша цель — чтобы вы думали только
            о творчестве, а организационные вопросы мы берем на себя.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Контакты</h2>
          <p className="text-gray-600">
            Есть вопросы или предложения? Напишите нам:
            <br />
            <a
              href="mailto:support@photomarket.ru"
              className="text-primary hover:underline"
            >
              support@photomarket.ru
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
