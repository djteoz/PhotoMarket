import Link from "next/link";
import { Camera, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <div className="p-1.5 bg-white rounded-lg">
                <Camera className="h-5 w-5 text-slate-900" />
              </div>
              <span>PhotoMarket</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Удобный сервис для поиска и бронирования фотостудий по всей
              России. Найдите идеальное место для вашей съемки.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://t.me/photomarket"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Telegram"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a
                href="https://vk.com/photomarket"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="VK"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.042-2.763-5.32-2.763-5.794 0-.254.102-.492.593-.492h1.744c.44 0 .61.203.78.678.864 2.508 2.305 4.712 2.898 4.712.22 0 .322-.102.322-.66V9.813c-.068-1.185-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.746c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.152-3.574 2.152-3.574.119-.254.322-.492.762-.492h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Навигация</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/search"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Поиск студий
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Каталог
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Сообщество
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  О нас
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Владельцам */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Владельцам студий</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/add-studio"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Добавить студию
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Тарифы
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Личный кабинет
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Контакты</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:support@photomarket.tech"
                  className="hover:text-white transition-colors"
                >
                  support@photomarket.tech
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4" />
                <span>Россия, Москва</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-white">Информация</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Пользовательское соглашение
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacts"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Обратная связь
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} PhotoMarket. Все права защищены.
          </p>
          <p className="text-xs text-slate-600">
            Сделано с ❤️ для фотографов России
          </p>
        </div>
      </div>
    </footer>
  );
}
