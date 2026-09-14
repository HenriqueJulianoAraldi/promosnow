"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Visão geral", icon: "grid" },
  { href: "/admin/produtos", label: "Produtos", icon: "box" },
  { href: "/admin/ofertas", label: "Ofertas", icon: "tag" },
  { href: "/admin/publicacoes", label: "Publicações", icon: "send" },
];
export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label="Navegação do painel">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={path === item.href ? "page" : undefined}
          className={path === item.href ? "selected" : ""}
        >
          <Icon name={item.icon} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
