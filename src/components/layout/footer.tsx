import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">PhotoMarket</h3>
            <p className="text-sm text-gray-600">
              Удобный сервис для поиска и бронирования фотостудий.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:underline">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:underline">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Правила
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Владельцам</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/add-studio" className="hover:underline">
                  Добавить студию
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:underline">
                  Тарифы
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <p className="text-sm text-gray-600">support@photomarket.com</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PhotoMarket. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
