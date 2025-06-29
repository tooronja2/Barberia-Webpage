
import { useBusiness } from "@/context/BusinessContext";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Menú principal (mismo orden de referencia)
const orderedMenu = [
  { texto: "Inicio", url: "/" },
  { texto: "Servicios", url: "/servicios" },
  { texto: "Reserva tu Turno", url: "/reservar-turno" },
  { texto: "Contacto", url: "/contacto" },
];

const Header = () => {
  const { config } = useBusiness();
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!config) return null;

  // --- Header para mobile ---
  if (isMobile) {
    return (
      <>
        <header className="w-full bg-background sticky top-0 z-50 border-b-0">
          <nav className="flex justify-between items-center max-w-5xl mx-auto py-3 px-4">
            <div className="flex items-center gap-2 font-heading font-bold text-lg text-foreground">
              {config.nombre_negocio}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-white">
                  <Menu size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50 bg-card">
                {orderedMenu.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <Link
                      to={item.url}
                      className="w-full cursor-pointer"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      {/* En el menú mobile "Reservar" es más corto */}
                      {item.texto === "Reserva tu Turno"
                        ? "Reservar"
                        : item.texto}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </header>
        {/* Separador fino debajo del header */}
        <div className="w-full h-[7px] bg-border" />
      </>
    );
  }

  // --- Header para desktop ---
  return (
    <>
      <header className="w-full bg-background sticky top-0 z-50 border-b-0">
        <nav className="flex justify-between max-w-7xl mx-auto py-3 px-6">
          <div className="flex items-center gap-2 font-heading font-bold text-2xl text-foreground">
            {config.nombre_negocio}
          </div>
          <ul className="flex items-center gap-12">
            {orderedMenu.map((item, i) => (
              <li key={i}>
                <Link
                  to={item.url}
                  className={`text-foreground hover:text-primary font-medium text-lg transition-colors duration-200 pb-1 border-b-2 border-transparent hover:border-primary ${
                    location.pathname === item.url
                      ? "border-primary"
                      : ""
                  }`}
                  tabIndex={0}
                >
                  {item.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      {/* Separador fino debajo del header */}
      <div className="w-full h-[7px] bg-primary" />
    </>
  );
};

export default Header;
