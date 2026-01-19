import { Mail, MapPin, Phone, MessageCircle, Clock, Send } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Свяжитесь с командой PhotoMarket. Мы всегда рады помочь с вопросами по бронированию фотостудий.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactsPage() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Адрес",
      content: "Россия, Москва",
      subtext: "Работаем по всей России",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Phone,
      title: "Телефон",
      content: "+7 (999) 799-46-74",
      subtext: "Пн-Пт: 10:00 - 19:00",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Mail,
      title: "Email",
      content: "support@photomarket.tech",
      subtext: "Ответим в течение 24 часов",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: MessageCircle,
      title: "Telegram",
      content: "@photomarket_support",
      subtext: "Быстрые ответы",
      color: "bg-sky-50 text-sky-600",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Свяжитесь с нами
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Мы всегда рады помочь. Выберите удобный способ связи или отправьте
            сообщение через форму.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {contactInfo.map((item) => (
              <Card
                key={item.title}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-slate-900 font-medium">{item.content}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.subtext}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-12">
              {/* Left side - Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Напишите нам</h2>
                  <p className="text-slate-600">
                    Заполните форму, и мы свяжемся с вами в ближайшее время.
                    Обычно мы отвечаем в течение нескольких часов в рабочее
                    время.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <span>Время ответа: до 24 часов</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Send className="h-5 w-5 text-slate-400" />
                    <span>Ответим на email или в Telegram</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Часто задаваемые темы:</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Вопросы по бронированию</li>
                    <li>• Добавление студии на платформу</li>
                    <li>• Техническая поддержка</li>
                    <li>• Сотрудничество и партнёрство</li>
                  </ul>
                </div>
              </div>

              {/* Right side - Form */}
              <div className="md:col-span-3">
                <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
