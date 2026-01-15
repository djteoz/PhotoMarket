import { Metadata } from "next";
import {
  FileText,
  Shield,
  Users,
  Camera,
  CreditCard,
  AlertTriangle,
  Ban,
  Scale,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Пользовательское соглашение — PhotoMarket",
  description: "Пользовательское соглашение сервиса PhotoMarket",
};

export default function TermsPage() {
  const lastUpdated = "15 января 2026";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-white/70">Юридическая информация</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Пользовательское соглашение
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
                  Настоящее Пользовательское соглашение (далее — «Соглашение»)
                  регулирует отношения между администрацией сайта{" "}
                  <strong>photomarket.tech</strong> (далее — «Платформа», «мы»)
                  и пользователями Платформы (далее — «Пользователь», «вы»).
                </p>
                <p className="text-slate-600 leading-relaxed mt-4">
                  Регистрируясь на Платформе или используя её функционал, вы
                  подтверждаете, что ознакомились с настоящим Соглашением и
                  принимаете его условия.
                </p>
              </CardContent>
            </Card>

            {/* 1. Общие положения */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  1. Общие положения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>
                  1.1. PhotoMarket — онлайн-платформа для поиска, бронирования и
                  управления фотостудиями.
                </p>
                <p>
                  1.2. Платформа предоставляет информационные услуги и является
                  посредником между арендаторами и владельцами студий.
                </p>
                <p>
                  1.3. Платформа не является стороной договора аренды между
                  Пользователем и Владельцем студии.
                </p>
                <p>
                  1.4. Использование Платформы возможно лицами, достигшими 18
                  лет.
                </p>
              </CardContent>
            </Card>

            {/* 2. Регистрация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  2. Регистрация и аккаунт
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>
                  2.1. Для полноценного использования Платформы требуется
                  регистрация.
                </p>
                <p>
                  2.2. При регистрации вы обязуетесь предоставить достоверную
                  информацию.
                </p>
                <p>
                  2.3. Вы несёте ответственность за сохранность данных для входа
                  в аккаунт.
                </p>
                <p>
                  2.4. Запрещается создание нескольких аккаунтов одним лицом.
                </p>
                <p>
                  2.5. Мы оставляем за собой право заблокировать аккаунт при
                  нарушении Соглашения.
                </p>
              </CardContent>
            </Card>

            {/* 3. Для арендаторов */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-green-600" />
                  3. Для арендаторов студий
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>
                  3.1. Бронирование студии осуществляется через Платформу или
                  напрямую по контактам студии.
                </p>
                <p>
                  3.2. Условия аренды (цена, время, правила) определяются
                  Владельцем студии.
                </p>
                <p>
                  3.3. Отмена бронирования регулируется правилами конкретной
                  студии.
                </p>
                <p>
                  3.4. Платформа не несёт ответственности за качество услуг,
                  предоставляемых студиями.
                </p>
                <p>
                  3.5. В случае споров с Владельцем студии, вы можете обратиться
                  в службу поддержки Платформы.
                </p>
              </CardContent>
            </Card>

            {/* 4. Для владельцев */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-amber-600" />
                  4. Для владельцев студий
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>
                  4.1. Владелец вправе разместить информацию о своей студии на
                  Платформе.
                </p>
                <p>
                  4.2. Владелец гарантирует достоверность предоставленной
                  информации (цены, фото, описание).
                </p>
                <p>
                  4.3. Владелец самостоятельно несёт ответственность за
                  соблюдение законодательства при оказании услуг.
                </p>
                <p>
                  4.4. Владелец обязуется своевременно обновлять информацию о
                  доступности и ценах.
                </p>
                <p>
                  4.5. Платформа вправе отклонить или удалить объявление без
                  объяснения причин.
                </p>
              </CardContent>
            </Card>

            {/* 5. Платежи */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-cyan-600" />
                  5. Платежи и тарифы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>5.1. Базовое использование Платформы бесплатно.</p>
                <p>
                  5.2. Платные услуги (PRO-тарифы, продвижение) оплачиваются
                  через ЮKassa.
                </p>
                <p>
                  5.3. Стоимость платных услуг указана на странице{" "}
                  <Link
                    href="/pricing"
                    className="text-purple-600 hover:underline"
                  >
                    Тарифы
                  </Link>
                  .
                </p>
                <p>
                  5.4. Возврат средств за платные услуги осуществляется в
                  соответствии с законодательством РФ.
                </p>
                <p>
                  5.5. Оплата аренды студий производится напрямую Владельцу,
                  если не указано иное.
                </p>
              </CardContent>
            </Card>

            {/* 6. Контент */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  6. Пользовательский контент
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>
                  6.1. Пользователи могут загружать фотографии, оставлять отзывы
                  и комментарии.
                </p>
                <p>
                  6.2. Загружая контент, вы подтверждаете наличие прав на его
                  использование.
                </p>
                <p>
                  6.3. Вы предоставляете Платформе право использовать
                  загруженный контент для работы сервиса.
                </p>
                <p>
                  6.4. Запрещён контент, нарушающий законодательство РФ,
                  авторские права, оскорбляющий других пользователей.
                </p>
                <p>
                  6.5. Мы вправе удалить любой контент без предварительного
                  уведомления.
                </p>
              </CardContent>
            </Card>

            {/* 7. Запреты */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  7. Запрещённые действия
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-3">
                  При использовании Платформы запрещается:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Нарушать законодательство Российской Федерации</li>
                  <li>
                    Размещать ложную или вводящую в заблуждение информацию
                  </li>
                  <li>Использовать Платформу для мошенничества</li>
                  <li>Собирать персональные данные других пользователей</li>
                  <li>Создавать помехи работе Платформы (DDoS, спам и т.д.)</li>
                  <li>Обходить технические ограничения Платформы</li>
                  <li>Размещать рекламу без согласования с Администрацией</li>
                </ul>
              </CardContent>
            </Card>

            {/* 8. Ответственность */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  8. Ограничение ответственности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>
                  8.1. Платформа предоставляется «как есть». Мы не гарантируем
                  бесперебойную работу сервиса.
                </p>
                <p>
                  8.2. Мы не несём ответственности за действия третьих лиц
                  (Владельцев студий, других пользователей).
                </p>
                <p>
                  8.3. Мы не несём ответственности за убытки, возникшие в
                  результате использования или невозможности использования
                  Платформы.
                </p>
                <p>
                  8.4. Максимальная ответственность Платформы ограничена суммой,
                  уплаченной Пользователем за платные услуги.
                </p>
              </CardContent>
            </Card>

            {/* 9. Разрешение споров */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-slate-600" />
                  9. Разрешение споров
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>9.1. Все споры решаются путём переговоров.</p>
                <p>
                  9.2. При невозможности достичь согласия, спор передаётся на
                  рассмотрение суда по месту нахождения Администрации.
                </p>
                <p>
                  9.3. К отношениям сторон применяется законодательство
                  Российской Федерации.
                </p>
              </CardContent>
            </Card>

            {/* 10. Изменения */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-600" />
                  10. Изменение Соглашения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>
                  10.1. Мы вправе изменять настоящее Соглашение в любое время.
                </p>
                <p>10.2. Актуальная версия всегда доступна на этой странице.</p>
                <p>
                  10.3. Продолжая использовать Платформу после изменений, вы
                  принимаете новые условия.
                </p>
              </CardContent>
            </Card>

            {/* Контакты */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Контакты</h3>
              <p className="text-slate-600">
                По вопросам, связанным с настоящим Соглашением:
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
              <Link
                href="/legal/privacy"
                className="text-purple-600 hover:underline"
              >
                → Политика конфиденциальности
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
