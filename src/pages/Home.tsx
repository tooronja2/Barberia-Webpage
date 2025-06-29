import SEOHead from "@/components/SEOHead";
import BannerHero from "@/components/BannerHero";
import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { useScrollAnimation, useParallax } from "@/hooks/useScrollAnimation";
import { AnimatedCard } from "@/components/AnimatedCard";
import { AnimatedButton } from "@/components/AnimatedButton";
import { PageTransition } from "@/components/PageTransition";
import { LoadingCard } from "@/components/LoadingSpinner";
import TestimonialsSection from "@/components/TestimonialsSection";

// NUEVA imagen personalizada para "Corte de Barba"
const CORTE_BARBA_IMG = "/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png";
// Imagen personalizada para "Corte de pelo y barba"
const CORTE_PELO_BARBA_IMG = "/lovable-uploads/c749b507-8002-4fd8-9d5d-20b9c3903632.png";

// Mantener el resto de imágenes locales para los otros servicios
const BARBERIA_IMAGES = [
  CORTE_BARBA_IMG,
  "/lovable-uploads/fc94f399-5202-49cf-8b59-4e5432fc8431.png",
  "/lovable-uploads/a0053cdf-42ff-4f6f-bf69-cd415ed3e773.png",
  "/lovable-uploads/6eb39621-7c2f-44a9-b43b-937dab14bcc2.png",
  "/lovable-uploads/1bbc1778-07ae-4750-ba3c-20216d2b8c60.png",
];

const aboutLines = [
  "En Barbería Central honramos la tradición y también abrazamos la innovación. Somos un equipo apasionado que busca que cada cliente viva mucho más que un simple corte.",
  "Creemos en crear un ambiente auténtico, relajado y de confianza, donde el detalle y la atención personalizada son nuestro sello distintivo.",
  "Te invitamos a compartir nuestra filosofía de conectar, potenciar tu estilo y disfrutar de una experiencia barberil única. ¡Bienvenido!",
];

const Home = () => {
  const { config, contenido, loading, error } = useBusiness();
  const { ref: aboutRef, revealed: aboutRevealed } = useRevealOnScroll<HTMLDivElement>();
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollAnimation({ threshold: 0.2 });
  const parallaxOffset = useParallax(0.3);

  return (
    <>
      <SEOHead />
      <PageTransition>
        <main className="bg-background min-h-screen pt-2 flex flex-col gap-4 scroll-smooth">
        <div 
          ref={heroRef}
          className={`parallax transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          <BannerHero />
        </div>

        {/* Sección Sobre Nosotros renovada con iconos */}
        <section className="max-w-6xl mx-auto mt-20 mb-16 px-4 md:px-0">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">
              SOBRE NOSOTROS
            </h2>
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-primary/30 w-20"></div>
              <div className="w-3 h-3 bg-primary rounded-full mx-4"></div>
              <div className="h-px bg-primary/30 w-20"></div>
            </div>
          </div>

          {/* Tarjetas de valores con iconos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <AnimatedCard
              animation="fadeInUp"
              delay={0}
              className="text-center p-8 bg-card border border-border rounded-2xl shadow-elegant hover:shadow-xl transition-all duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl text-primary-foreground">✂️</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">CALIDAD</h3>
              <div className="text-3xl font-bold text-primary mb-2">25+</div>
              <p className="text-muted-foreground font-body">Años de experiencia perfeccionando nuestro arte</p>
            </AnimatedCard>

            <AnimatedCard
              animation="fadeInUp"
              delay={200}
              className="text-center p-8 bg-card border border-border rounded-2xl shadow-elegant hover:shadow-xl transition-all duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl text-secondary-foreground">🏆</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">ESTILO</h3>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground font-body">Técnicas modernas combinadas con tradición</p>
            </AnimatedCard>

            <AnimatedCard
              animation="fadeInUp"
              delay={400}
              className="text-center p-8 bg-card border border-border rounded-2xl shadow-elegant hover:shadow-xl transition-all duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl text-accent-foreground">👥</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">CONFIANZA</h3>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground font-body">Clientes satisfechos que confían en nosotros</p>
            </AnimatedCard>
          </div>

          {/* Texto descriptivo mejorado */}
          <AnimatedCard
            animation="fadeInUp"
            delay={600}
            className="text-center p-8 md:p-12 bg-gradient-to-r from-card via-card/90 to-card border border-border rounded-2xl shadow-elegant"
          >
            <p className="text-lg md:text-xl text-foreground/90 font-body leading-relaxed max-w-4xl mx-auto">
              En <span className="text-primary font-semibold">Barbería Central</span> combinamos la tradición 
              con las técnicas más modernas. Nuestro equipo de profesionales se dedica a realzar tu estilo 
              personal en un ambiente cálido y acogedor, donde cada detalle cuenta para brindarte una 
              experiencia única e inolvidable.
            </p>
          </AnimatedCard>
        </section>

        {/* Mostrar todos los servicios */}
        <section
          ref={servicesRef}
          className="max-w-6xl mx-auto mt-10 mb-10 px-4 md:px-0"
        >
          <h2 className={`text-3xl font-heading font-bold mb-8 tracking-tight text-center text-foreground transition-all duration-700 ${
            servicesVisible ? 'opacity-100 translate-y-0 animate-fadeInUp' : 'opacity-0 translate-y-8'
          }`}>
            Nuestros Servicios
          </h2>
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          )}
          {error && <div className="text-center text-red-500 animate-bounceIn">{error}</div>}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {contenido &&
                contenido.map((item, i) => (
                  <AnimatedCard
                    key={item.id}
                    animation={i % 2 === 0 ? "fadeInLeft" : "fadeInRight"}
                    delay={i * 150}
                    hover="lift"
                    className="group bg-card border border-border rounded-2xl shadow-elegant overflow-hidden transform-gpu will-change-transform"
                  >
                    <div className="overflow-hidden relative">
                      <img
                        src={
                          item.id === "corte-barba"
                            ? CORTE_BARBA_IMG
                            : item.id === "corte-pelo-barba"
                            ? CORTE_PELO_BARBA_IMG
                            : BARBERIA_IMAGES[i % BARBERIA_IMAGES.length]
                        }
                        alt={item.nombre}
                        className="w-full object-cover h-48 border-b border-border transition-all duration-500 group-hover:scale-110 transform-gpu"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="flex flex-col gap-2 p-5">
                      <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 transition-all duration-300">
                        {item.nombre}
                        {item.en_oferta && (
                          <span className="ml-1 px-2 py-0.5 text-xs text-primary bg-secondary rounded-full font-semibold animate-pulse">
                            Oferta!
                          </span>
                        )}
                      </h3>
                      <div className="text-muted-foreground text-base mb-2 min-h-[40px] transition-colors duration-300 group-hover:text-foreground/90">{item.descripcion_breve}</div>
                      <div className="mt-2 flex gap-2 items-center text-lg">
                        <span className="font-bold text-primary transition-all duration-300">
                          {config?.moneda_simbolo}
                          {item.precio_oferta ?? item.precio}
                        </span>
                        {item.precio_oferta && (
                          <span className="line-through text-sm text-muted-foreground">
                            {config?.moneda_simbolo}
                            {item.precio}
                          </span>
                        )}
                      </div>
                      <Link to="/reservar-turno" className="mt-4">
                        <AnimatedButton
                          className="w-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90"
                          pulse={item.en_oferta}
                        >
                          Reservar
                        </AnimatedButton>
                      </Link>
                    </div>
                  </AnimatedCard>
                ))}
            </div>
          )}
        </section>

        {/* Sección de Testimonios */}
        <TestimonialsSection />

        {/* Banner de Reservar Turno */}
        <AnimatedCard 
          animation="scaleIn"
          className="max-w-4xl mx-auto my-14 flex flex-col items-center justify-center py-10 bg-card border border-border shadow-elegant"
          hover="lift"
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-5 text-center text-foreground">
            ¿Querés reservar un turno?
          </h2>
          <Link to="/reservar-turno">
            <AnimatedButton
              size="lg"
              className="bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold min-w-[230px] hover:bg-primary/90"
              pulse
            >
              Reservá tu turno
            </AnimatedButton>
          </Link>
        </AnimatedCard>

        {/* Dirección abajo de todo */}
        {config && (
          <AnimatedCard
            animation="slideInBottom"
            className="max-w-xl mx-auto mb-8 px-4"
          >
            <div className="bg-card border border-border rounded-xl shadow-elegant p-6">
              <h3 className="text-xl font-heading font-bold mb-2 text-foreground animate-fadeInUp">¿Dónde estamos?</h3>
              <div className="font-semibold text-foreground/90 animate-fadeInLeft" style={{ animationDelay: '200ms' }}>{config?.direccion_fisica}</div>
              <div className="text-muted-foreground mt-2 animate-fadeInLeft" style={{ animationDelay: '400ms' }}>{config?.telefono_contacto}</div>
              <div className="text-muted-foreground animate-fadeInLeft" style={{ animationDelay: '600ms' }}>{config?.email_contacto}</div>
            </div>
          </AnimatedCard>
        )}
        </main>
      </PageTransition>
    </>
  );
};

export default Home;
