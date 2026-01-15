import { Metadata } from "next";
import {
  Building2,
  FileText,
  CreditCard,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Реквизиты — PhotoMarket",
  description: "Юридическая информация и реквизиты компании PhotoMarket",
};

export default function RequisitesPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold">Реквизиты компании</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Основные сведения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Получатель
                    </p>
                    <p className="font-medium">Игонькин Александр Валерьевич</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ИНН</p>
                    <p className="font-medium font-mono">760215097960</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Банковские реквизиты */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Банковские реквизиты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Банк</p>
                    <p className="font-medium">Калужское отделение №8608 ПАО Сбербанк</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">БИК</p>
                    <p className="font-medium font-mono">042908612</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Номер счёта
                    </p>
                    <p className="font-medium font-mono">
                      40817810677031163288
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Корр. счёт</p>
                    <p className="font-medium font-mono">
                      30101810100000000612
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Валюта</p>
                    <p className="font-medium">Российский рубль (RUB)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SWIFT</p>
                    <p className="font-medium font-mono">SABRRUM3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Реквизиты банка */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Реквизиты банка
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ИНН банка</p>
                    <p className="font-medium font-mono">7707083893</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">КПП</p>
                    <p className="font-medium font-mono">760402001</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ОГРН</p>
                    <p className="font-medium font-mono">1027700132195</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ОКПО</p>
                    <p className="font-medium font-mono">02819187</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Контактная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Контактная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">support@photomarket.tech</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Телефон</p>
                      <p className="font-medium">+7 (999) 799-46-74</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Примечание */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Важно:</strong> Платежи на сайте обрабатываются через
                сервис ЮKassa (ООО «ЮКасса»). Мы не храним данные банковских
                карт на нашем сервере.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
