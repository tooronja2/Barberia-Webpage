
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
        <header className={`w-full sticky top-0 z-50 border-b-0 transition-all duration-500 transform-gpu ${
          isScrolled 
            ? 'bg-card/95 backdrop-blur-xl shadow-2xl border-b border-border/50' 
            : 'bg-background/90 backdrop-blur-sm'
        }`}>
          <nav className="flex justify-between items-center max-w-5xl mx-auto py-4 px-4">
            <div className={`flex items-center gap-2 font-heading font-bold text-lg transition-all duration-300 ${
              isScrolled ? 'text-primary' : 'text-foreground'
            } hover:scale-105 cursor-pointer`}>
              <span className="text-xl">✂️</span>
              {config.nombre_negocio}
            </div>
            <DropdownMenu onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className={`relative p-3 rounded-full transition-all duration-300 hover:scale-110 touch-target ${
                  isScrolled ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-foreground'
                } ${isMenuOpen ? 'rotate-180 scale-110' : ''}`}>
                  <Menu size={20} className="transition-transform duration-300" />
                  {isMenuOpen && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 z-50 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-2 animate-slideUpFadeIn"
              >
                {orderedMenu.map((item, i) => (
                  <DropdownMenuItem 
                    key={i} 
                    asChild 
                    className="transition-all duration-300 hover:bg-primary/10 rounded-xl mb-1 last:mb-0"
                  >
                    <Link
                      to={item.url}
                      className={`w-full cursor-pointer flex items-center gap-3 p-3 transition-all duration-300 touch-target rounded-xl ${
                        location.pathname === item.url 
                          ? 'text-primary font-semibold bg-primary/10 shadow-lg' 
                          : 'text-foreground hover:text-primary'
                      }`}
                    >
                      <span className="text-lg">
                        {item.url === '/' ? '🏠' : 
                         item.url === '/servicios' ? '✂️' :
                         item.url === '/reservar-turno' ? '📅' :
                         item.url === '/contacto' ? '📞' : '📄'}
                      </span>
                      {item.texto === "Reserva tu Turno" ? "Reservar" : item.texto}
                      {location.pathname === item.url && (
                        <span className="ml-auto text-primary">●</span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </header>
        {/* Separador animado */}
        <div className={`w-full h-1 transition-all duration-500 ${
          isScrolled 
            ? 'bg-gradient-to-r from-primary via-accent to-primary' 
            : 'bg-gradient-to-r from-border via-primary/20 to-border'
        }`} />
      </>
    );
  }

  // --- Header para desktop ---
  return (
    <>
      <header className={`w-full sticky top-0 z-50 border-b-0 transition-all duration-500 transform-gpu ${
        isScrolled 
          ? 'bg-card/95 backdrop-blur-xl shadow-2xl border-b border-border/20' 
          : 'bg-background/90 backdrop-blur-sm'
      }`}>
        <nav className="flex justify-between max-w-7xl mx-auto py-4 px-6">
          <div className={`flex items-center gap-3 font-heading font-bold text-2xl transition-all duration-300 cursor-pointer group ${
            isScrolled ? 'text-primary' : 'text-foreground'
          } hover:scale-105`}>
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">✂️</span>
            <span className="group-hover:text-primary transition-colors duration-300">
              {config.nombre_negocio}
            </span>
          </div>
          <ul className="flex items-center gap-8">
            {orderedMenu.map((item, i) => (
              <li key={i} className="relative group">
                <Link
                  to={item.url}
                  className={`relative text-foreground font-medium text-lg transition-all duration-300 py-2 px-4 rounded-full hover:scale-105 ${
                    location.pathname === item.url
                      ? "text-primary bg-primary/10 shadow-lg"
                      : "hover:text-primary hover:bg-primary/5"
                  }`}
                  tabIndex={0}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-base">
                      {item.url === '/' ? '🏠' : 
                       item.url === '/servicios' ? '✂️' :
                       item.url === '/reservar-turno' ? '📅' :
                       item.url === '/contacto' ? '📞' : '📄'}
                    </span>
                    {item.texto}
                  </span>
                  
                  {/* Efecto de background animado */}
                  <span className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full transform transition-transform duration-300 ${
                    location.pathname === item.url ? 'scale-100' : 'scale-0 group-hover:scale-100'
                  }`} />
                  
                  {/* Indicador activo */}
                  {location.pathname === item.url && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-lg animate-pulse" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      {/* Separador animado mejorado */}
      <div className={`w-full h-1 transition-all duration-500 relative overflow-hidden ${
        isScrolled 
          ? 'bg-gradient-to-r from-primary via-accent to-primary' 
          : 'bg-gradient-to-r from-border via-primary/30 to-border'
      }`}>
        {isScrolled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}
      </div>
    </>
  );
};

export default Header;
