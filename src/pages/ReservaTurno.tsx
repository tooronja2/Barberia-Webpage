
import SEOHead from "@/components/SEOHead";
import CalendarioCustom from "@/components/CalendarioCustom";
import { useBusiness } from "@/context/BusinessContext";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { useScrollAnimation, useSwipeGesture } from "@/hooks/useScrollAnimation";
import { AnimatedCard } from "@/components/AnimatedCard";
import { AnimatedButton } from "@/components/AnimatedButton";
import { PageTransition } from "@/components/PageTransition";
import ServiceCard from "@/components/ServiceCard";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CORTE_BARBA_IMG = "/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png";
const CORTE_PELO_BARBA_IMG = "/lovable-uploads/c749b507-8002-4fd8-9d5d-20b9c3903632.png";

const BARBERIA_IMAGES = [
  CORTE_BARBA_IMG,
  "/lovable-uploads/fc94f399-5202-49cf-8b59-4e5432fc8431.png",
  "/lovable-uploads/a0053cdf-42ff-4f6f-bf69-cd415ed3e773.png",
  "/lovable-uploads/6eb39621-7c2f-44a9-b43b-937dab14bcc2.png",
  "/lovable-uploads/1bbc1778-07ae-4750-ba3c-20216d2b8c60.png",
];

const ESPECIALISTAS = [
  {
    nombre: "Héctor Medina",
    foto: "https://randomuser.me/api/portraits/men/32.jpg",
    especialidad: "Corte y barba clásico"
  },
  {
    nombre: "Lucas Peralta",
    foto: "https://randomuser.me/api/portraits/men/66.jpg",
    especialidad: "Estilos modernos"
  },
  {
    nombre: "Camila González",
    foto: "https://randomuser.me/api/portraits/women/68.jpg",
    especialidad: "Tratamientos capilares"
  },
];

const ReservaTurno = () => {
  const { config, contenido } = useBusiness();
  const navigate = useNavigate();
  
  // Leemos la preselección desde localStorage solo UNA vez al arrancar
  const [servicio, setServicio] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const pre = localStorage.getItem("servicioSeleccionado");
      localStorage.removeItem("servicioSeleccionado");
      return pre || null;
    }
    return null;
  });
  
  // Si hay preseleccion, arrancar paso 2; si no, el 1:
  const [paso, setPaso] = useState<1 | 2 | 3>(servicio ? 2 : 1);
  const [staff, setStaff] = useState<number | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleReservaConfirmada = () => {
    navigate('/');
  };

  // Definir iconos y datos adicionales para los servicios
  const getServiceIcon = (serviceId: string): string => {
    const icons: Record<string, string> = {
      'corte-barba': '✂️',
      'corte-pelo-barba': '🧔',
      'corte-clasico': '✂️',
      'corte-moderno': '💫',
      'infantil': '👶',
      'diseno': '🎨',
      'express': '⚡'
    };
    return icons[serviceId] || '✂️';
  };

  const getServiceDescription = (item: any): string => {
    const descriptions: Record<string, string> = {
      'corte-barba': 'Perfilado y arreglo profesional de barba con técnicas tradicionales',
      'corte-pelo-barba': 'Servicio completo: corte personalizado + arreglo de barba',
      'corte-clasico': 'Corte tradicional según tu estilo personal',
      'corte-moderno': 'Estilos actuales y diseños modernos',
      'infantil': 'Cortes especiales para niños en ambiente cómodo',
      'diseno': 'Rapados y diseños personalizados únicos',
      'express': 'Corte rápido manteniendo la calidad'
    };
    return descriptions[item.id] || item.descripcion_breve || 'Servicio profesional de barbería';
  };

  // Paso 1: Selección de servicio con nuevo diseño
  if (paso === 1) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-background pt-8 pb-16">
          {/* Header mejorado */}
          <div className="max-w-6xl mx-auto px-4 mb-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">
                ¿QUERÉS RESERVAR UN TURNO?
              </h1>
              <div className="flex items-center justify-center mb-6">
                <div className="h-px bg-primary/30 w-20"></div>
                <div className="w-3 h-3 bg-primary rounded-full mx-4"></div>
                <div className="h-px bg-primary/30 w-20"></div>
              </div>
              <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto mb-8">
                Seleccioná tu servicio y elegí el horario que más te convenga
              </p>
            </div>
          </div>

          {/* Grid de servicios */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contenido?.map((item, idx) => (
                <ServiceCard
                  key={item.id}
                  id={item.id}
                  name={item.nombre}
                  description={getServiceDescription(item)}
                  price={item.precio_oferta ?? item.precio}
                  originalPrice={item.precio_oferta ? item.precio : undefined}
                  icon={getServiceIcon(item.id)}
                  popular={item.en_oferta || idx === 1} // Hacer popular el segundo servicio o los en oferta
                  selected={servicio === item.id}
                  onSelect={() => {
                    setServicio(item.id);
                    setPaso(2);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Call to action adicional */}
          <div className="max-w-4xl mx-auto px-4 mt-16">
            <AnimatedCard
              animation="fadeInUp"
              className="text-center p-8 bg-gradient-to-r from-card via-card/90 to-card border border-border rounded-2xl shadow-elegant"
            >
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                ¿No encontrás lo que buscás?
              </h3>
              <p className="text-muted-foreground mb-6">
                Contáctanos y te ayudamos a encontrar el servicio perfecto para vos
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  📞 Llamar Ahora
                </AnimatedButton>
                <AnimatedButton
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  📱 WhatsApp
                </AnimatedButton>
              </div>
            </AnimatedCard>
          </div>
        </main>
      </PageTransition>
    );
  }

  // Paso 2: Selección de staff
  if (paso === 2 && servicio) {
    const itemSel = contenido?.find((it) => it.id === servicio);
    return (
      <main className="max-w-sm mx-auto pt-6 pb-12 bg-background text-foreground">
        <button className="mb-3 text-primary text-sm" onClick={() => setPaso(1)}>← Volver a servicios</button>
        <h2 className="text-xl font-heading font-semibold mb-4 text-center">Elegí con quién reservar</h2>
        <div className="flex flex-col gap-4">
          {ESPECIALISTAS.map((s, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-4 w-full bg-card px-4 py-3 rounded-xl border border-border shadow hover:bg-accent transition ${staff === idx ? "border-primary shadow-lg scale-105" : ""}`}
              onClick={() => { setStaff(idx); setPaso(3); }}
            >
              <img src={s.foto} alt={s.nombre} className="h-12 w-12 rounded-full border border-dark-200" />
              <div>
                <div className="font-semibold text-foreground">{s.nombre}</div>
                <div className="text-xs text-light-100">{s.especialidad}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // Paso 3: Mostrar calendario personalizado
  if (paso === 3 && staff !== null && servicio) {
    const especialista = ESPECIALISTAS[staff];
    return (
      <main className="max-w-lg mx-auto pt-6 pb-12 bg-background text-foreground">
        <button className="mb-5 text-primary text-sm" onClick={() => setPaso(2)}>
          ← Elegir otro especialista
        </button>
        
        <div className="text-center mb-6">
          <h3 className="text-lg font-heading font-bold mb-2">Reservar con {especialista.nombre}</h3>
          <img src={especialista.foto} alt={especialista.nombre} className="h-16 w-16 mx-auto rounded-full border border-dark-200 mb-2" />
          <div className="text-sm text-light-100">{especialista.especialidad}</div>
        </div>

        <CalendarioCustom 
          servicioId={servicio}
          responsable={especialista.nombre}
          onReservaConfirmada={handleReservaConfirmada}
        />
      </main>
    );
  }

  return null;
};

export default ReservaTurno;
