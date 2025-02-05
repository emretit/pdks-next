import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "./ui/button";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="w-full bg-primary shadow-lg">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo ve Başlık */}
          <div className="flex items-center space-x-4">
            <img
              src="/ngs-logo.png"
              alt="NGS Logo"
              className="h-14 w-auto mr-4 object-contain transition-transform hover:scale-105"
            />
            <h1 className="text-white text-2xl font-bold tracking-tight">
              NGS PDKS
              <span className="block text-sm font-normal mt-1">
                Personel Devam Kontrol Sistemi
              </span>
            </h1>
          </div>

          {/* Ana Navigasyon */}
          <ul className="hidden lg:flex items-center space-x-6">
            <li>
              <Link
                href="/protected/dashboard"
                className="text-white hover:text-gray-200 transition-colors font-medium"
              >
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link
                href="/protected/devices"
                className="text-white hover:text-gray-200 transition-colors font-medium"
              >
                Cihazlar
              </Link>
            </li>
            <li>
              <Link
                href="/protected/employees"
                className="text-white hover:text-gray-200 transition-colors font-medium"
              >
                Çalışanlar
              </Link>
            </li>
            <li>
              <Link
                href="/protected/card-reads"
                className="text-white hover:text-gray-200 transition-colors font-medium"
              >
                Geçiş Kontrol
              </Link>
            </li>
            <li>
              <Link
                href="/protected/pdks-management"
                className="text-white hover:text-gray-200 transition-colors font-medium"
              >
                PDKS Yönetimi
              </Link>
            </li>
            <li>
              <Link
                href="/protected/admin"
                className="text-white hover:text-gray-200 transition-colors font-medium"
              >
                Yönetim Paneli
              </Link>
            </li>
          </ul>

          {/* Kullanıcı Menüsü */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-white">{user.email}</span>
                <form action="/auth/sign-out" method="post">
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-white/10"
                  >
                    Çıkış Yap
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  <Link href="/sign-in">Giriş Yap</Link>
                </Button>
                <Button
                  asChild
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Link href="/sign-up">Kayıt Ol</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
