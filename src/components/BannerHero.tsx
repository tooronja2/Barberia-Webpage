import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";
import { AnimatedButton } from "./AnimatedButton";

const BannerHero = () => {
  const { config } = useBusiness();

  return (
    <div className="relative w-full min-h-[85vh] sm:min-h-[80vh] md:min-h-[85vh] lg:min-h-[90vh] bg-gradient-to-br from-background via-card to-background mb-8 mt-4 rounded-2xl overflow-hidden shadow-2xl max-w-7xl mx-auto">
      {/* Imagen de fondo mejorada */}
      <img 
        src="/lovable-uploads/c3696121-578a-4be5-b41c-0c2ba0298c01.png"
        alt="Interior de Barbería Central"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        loading="eager"
      />

      {/* Overlay con gradiente sofisticado */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/70 to-background/50"></div>
      <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      
      {/* Efectos de luz dorada sutiles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-2xl opacity-15"></div>

      {/* Contenido principal centrado */}
      <div className="relative h-full flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20">
        <div className="text-center max-w-6xl w-full">
          {/* Logo/Título principal */}
          <div className="mb-8 px-4 min-h-[240px] sm:min-h-[260px] md:min-h-[300px] lg:min-h-[340px] flex items-center justify-center overflow-visible">
            <h1 className="text-center w-full break-words overflow-visible font-heading font-bold text-foreground tracking-tight max-w-6xl mx-auto"
                style={{ 
                  fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                  lineHeight: 'clamp(3rem, 9vw, 7rem)',
                  textWrap: 'balance' as any
                }}>
              <div className="block text-primary mb-2 overflow-visible">
                BARBERÍA
              </div>
              <div className="block text-foreground overflow-visible">
                CENTRAL
              </div>
            </h1>
          </div>

          {/* Eslogan elegante con sombra */}
          <div className="mb-8 max-w-4xl mx-auto">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-body text-foreground font-light tracking-wide bg-black/50 px-6 py-4 rounded-xl shadow-2xl">
              {config?.banner_principal.subtitulo || "Donde el estilo cobra vida"}
            </p>
          </div>

          {/* Separador visual */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-primary/30 w-16"></div>
            <div className="w-2 h-2 bg-primary rounded-full mx-4"></div>
            <div className="h-px bg-primary/30 w-16"></div>
          </div>

          {/* Botón CTA destacado con backdrop */}
          <div className="space-y-4">
            <div className="inline-block backdrop-blur-sm bg-background/20 p-4 rounded-2xl border border-primary/20">
              <Link to="/reservar-turno">
                <AnimatedButton
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent text-background font-bold px-12 py-4 text-xl tracking-wide shadow-2xl hover:shadow-primary/50 transition-all duration-300 border-2 border-primary/30 hover:border-primary/60 hover:scale-105"
                  pulse
                  glow
                >
                  🔥 RESERVÁ TU TURNO
                </AnimatedButton>
              </Link>
            </div>
            
            {/* Texto de apoyo */}
            <p className="text-sm text-muted-foreground font-accent uppercase tracking-wider">
              Turnos disponibles • Profesionales expertos • Ambiente único
            </p>
          </div>
        </div>
      </div>

      {/* Indicadores de calidad */}
      <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8">
        <div className="flex justify-center items-center space-x-4 sm:space-x-8 text-foreground/70">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary">25+</div>
            <div className="text-xs font-accent uppercase tracking-wide">Años</div>
          </div>
          <div className="w-px h-6 sm:h-8 bg-border"></div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary">1000+</div>
            <div className="text-xs font-accent uppercase tracking-wide">Clientes</div>
          </div>
          <div className="w-px h-6 sm:h-8 bg-border"></div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary">⭐⭐⭐⭐⭐</div>
            <div className="text-xs font-accent uppercase tracking-wide">Calificación</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerHero;
