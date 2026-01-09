import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export default function ContactsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Контакты</h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-lg text-muted-foreground mb-6">
            Мы всегда рады помочь вам. Свяжитесь с нами любым удобным способом.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Адрес</h3>
                <p className="text-muted-foreground">
                  г. Москва, ул. Примерная, д. 123, оф. 45
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Телефон</h3>
                <p className="text-muted-foreground">+7 (999) 799-46-74</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Пн-Пт: 10:00 - 19:00
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-muted-foreground">
                  support@photomarket.tech
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Напишите нам</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
