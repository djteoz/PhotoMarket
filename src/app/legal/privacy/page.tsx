import { Metadata } from "next";
import {
  Shield,
  Eye,
  Database,
  Lock,
  Mail,
  Globe,
  Users,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — PhotoMarket",
  description:
    "Политика обработки персональных данных на платформе PhotoMarket",
};

export default function PrivacyPage() {
  const lastUpdated = "15 января 2026";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-white/70">Юридическая информация</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Политика конфиденциальности
          </h1>
          <p className="text-slate-400">Последнее обновление: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Введение */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600 leading-relaxed">
                  Настоящая Политика конфиденциальности описывает, как
                  PhotoMarket (далее — «Платформа», «мы», «нас») собирает,
                  использует и защищает информацию, которую вы предоставляете
                  при использовании нашего сайта
                  <strong> photomarket.tech</strong>.
                </p>
                <p className="text-slate-600 leading-relaxed mt-4">
                  Используя Платформу, вы соглашаетесь с условиями данной
                  Политики.
                </p>
              </CardContent>
            </Card>

            {/* 1. Какие данные мы собираем */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  1. Какие данные мы собираем
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    Данные, которые вы предоставляете:
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Имя и фамилия</li>
                    <li>Адрес электронной почты</li>
                    <li>Номер телефона (при желании)</li>
                    <li>Данные профиля (аватар, описание)</li>
                    <li>Информация о студиях (для владельцев)</li>
                    <li>Отзывы и комментарии</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Данные, собираемые автоматически:
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>IP-адрес</li>
                    <li>Тип браузера и устройства</li>
                    <li>
                      Данные об использовании сайта (просмотренные страницы)
                    </li>
                    <li>Cookies и аналогичные технологии</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 2. Цели обработки */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  2. Цели обработки данных
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Предоставление доступа к функционалу Платформы</li>
                  <li>Обработка бронирований фотостудий</li>
                  <li>Связь с вами по вопросам использования сервиса</li>
                  <li>Улучшение качества услуг и пользовательского опыта</li>
                  <li>Отправка уведомлений о бронированиях и сообщениях</li>
                  <li>
                    Предотвращение мошенничества и обеспечение безопасности
                  </li>
                  <li>Выполнение требований законодательства</li>
                </ul>
              </CardContent>
            </Card>

            {/* 3. Передача данных */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  3. Передача данных третьим лицам
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Мы не продаём и не передаём ваши персональные данные третьим
                  лицам для маркетинговых целей. Данные могут быть переданы
                  только:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>
                    <strong>Clerk</strong> — для аутентификации пользователей
                  </li>
                  <li>
                    <strong>Vercel</strong> — хостинг-провайдер
                  </li>
                  <li>
                    <strong>Neon/PostgreSQL</strong> — хранение данных
                  </li>
                  <li>
                    <strong>ЮKassa</strong> — обработка платежей (при оплате)
                  </li>
                  <li>
                    <strong>Государственные органы</strong> — по требованию
                    закона
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. Защита данных */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  4. Защита данных
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Мы принимаем необходимые меры для защиты ваших данных:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Шифрование данных при передаче (HTTPS/TLS)</li>
                  <li>Безопасное хранение паролей (через Clerk)</li>
                  <li>Ограниченный доступ к персональным данным</li>
                  <li>Регулярный мониторинг безопасности</li>
                  <li>Мы не храним данные банковских карт на наших серверах</li>
                </ul>
              </CardContent>
            </Card>

            {/* 5. Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-amber-600" />
                  5. Файлы Cookies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Мы используем cookies для:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Поддержания сессии авторизации</li>
                  <li>Сохранения ваших предпочтений</li>
                  <li>Аналитики использования сайта</li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Вы можете отключить cookies в настройках браузера, однако это
                  может ограничить функциональность сайта.
                </p>
              </CardContent>
            </Card>

            {/* 6. Ваши права */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-slate-600" />
                  6. Ваши права
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  В соответствии с законодательством РФ, вы имеете право:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Получить информацию о хранимых данных</li>
                  <li>Исправить неточные данные в профиле</li>
                  <li>Удалить свой аккаунт и связанные данные</li>
                  <li>Отозвать согласие на обработку данных</li>
                  <li>Подать жалобу в Роскомнадзор</li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Для реализации этих прав свяжитесь с нами:
                  <a
                    href="mailto:support@photomarket.tech"
                    className="text-purple-600 hover:underline ml-1"
                  >
                    support@photomarket.tech
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* 7. Изменения */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-600" />
                  7. Изменения политики
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Мы можем обновлять данную Политику. Актуальная версия всегда
                  доступна на этой странице. При существенных изменениях мы
                  уведомим вас по электронной почте или через уведомление на
                  сайте.
                </p>
              </CardContent>
            </Card>

            {/* Контакты */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Контакты</h3>
              <p className="text-slate-600">
                По вопросам, связанным с обработкой персональных данных,
                обращайтесь:
              </p>
              <ul className="mt-3 space-y-1 text-slate-700">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:support@photomarket.tech"
                    className="text-purple-600 hover:underline"
                  >
                    support@photomarket.tech
                  </a>
                </li>
                <li>Телефон: +7 (999) 799-46-74</li>
              </ul>
            </div>

            {/* Навигация */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/terms" className="text-purple-600 hover:underline">
                → Пользовательское соглашение
              </Link>
              <Link
                href="/legal/requisites"
                className="text-purple-600 hover:underline"
              >
                → Реквизиты
              </Link>
              <Link
                href="/contacts"
                className="text-purple-600 hover:underline"
              >
                → Контакты
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
