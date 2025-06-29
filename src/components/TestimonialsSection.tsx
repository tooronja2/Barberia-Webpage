import React, { useState, useEffect } from 'react';
import { AnimatedCard } from './AnimatedCard';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  comment: string;
  service: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Carlos M.",
    rating: 5,
    comment: "Excelente atención y muy profesional. El corte quedó perfecto y el ambiente es muy cómodo. Súper recomendable.",
    service: "Corte y Barba",
    date: "Hace 2 semanas"
  },
  {
    id: 2,
    name: "Diego R.",
    rating: 5,
    comment: "El mejor corte que me hice en años. Los barberos realmente saben lo que hacen. Volveré seguro.",
    service: "Corte Clásico",
    date: "Hace 1 mes"
  },
  {
    id: 3,
    name: "Martín L.",
    rating: 5,
    comment: "Ambiente increíble, música genial y un corte de primera. Ya es mi barbería de confianza.",
    service: "Diseño Personalizado",
    date: "Hace 3 semanas"
  },
  {
    id: 4,
    name: "Fernando S.",
    rating: 5,
    comment: "Servicio de calidad, precios justos y siempre con buena onda. Los recomiendo al 100%.",
    service: "Corte Express",
    date: "Hace 1 semana"
  },
  {
    id: 5,
    name: "Lucas P.",
    rating: 5,
    comment: "Muy profesionales, lugar limpio y ordenado. Se nota la experiencia de años trabajando.",
    service: "Corte Infantil",
    date: "Hace 2 días"
  }
];

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`text-lg ${i < rating ? 'text-primary' : 'text-muted-foreground/30'}`}
      >
        ⭐
      </span>
    ));
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length]
  ];

  return (
    <section className="max-w-7xl mx-auto mt-20 mb-16 px-4 md:px-0">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">
          LO QUE DICEN NUESTROS CLIENTES
        </h2>
        <div className="flex items-center justify-center mb-6">
          <div className="h-px bg-primary/30 w-20"></div>
          <div className="w-3 h-3 bg-primary rounded-full mx-4"></div>
          <div className="h-px bg-primary/30 w-20"></div>
        </div>
        <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
          La satisfacción de nuestros clientes es nuestra mayor recompensa
        </p>
      </div>

      {/* Desktop: 3 testimonials side by side */}
      <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
        {visibleTestimonials.map((testimonial, index) => (
          <AnimatedCard
            key={`${testimonial.id}-${currentIndex}`}
            animation="fadeInUp"
            delay={index * 200}
            className="p-6 bg-card border border-border rounded-2xl shadow-elegant hover:shadow-xl transition-all duration-300 h-full"
          >
            <div className="flex flex-col h-full">
              {/* Stars */}
              <div className="flex justify-center mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              {/* Comment */}
              <blockquote className="text-foreground/90 font-body text-center italic mb-6 flex-grow">
                "{testimonial.comment}"
              </blockquote>
              
              {/* Author info */}
              <div className="text-center border-t border-border pt-4">
                <div className="font-semibold text-foreground mb-1">{testimonial.name}</div>
                <div className="text-sm text-primary font-medium mb-1">{testimonial.service}</div>
                <div className="text-xs text-muted-foreground">{testimonial.date}</div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Mobile: Single testimonial with navigation */}
      <div className="md:hidden">
        <AnimatedCard
          key={`mobile-${testimonials[currentIndex].id}`}
          animation="fadeInUp"
          className="p-6 bg-card border border-border rounded-2xl shadow-elegant mb-6"
        >
          <div className="text-center">
            {/* Stars */}
            <div className="flex justify-center mb-4">
              {renderStars(testimonials[currentIndex].rating)}
            </div>
            
            {/* Comment */}
            <blockquote className="text-foreground/90 font-body italic mb-6">
              "{testimonials[currentIndex].comment}"
            </blockquote>
            
            {/* Author info */}
            <div className="border-t border-border pt-4">
              <div className="font-semibold text-foreground mb-1">{testimonials[currentIndex].name}</div>
              <div className="text-sm text-primary font-medium mb-1">{testimonials[currentIndex].service}</div>
              <div className="text-xs text-muted-foreground">{testimonials[currentIndex].date}</div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center space-x-4">
        {/* Previous button */}
        <button
          onClick={prevTestimonial}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg"
          onMouseEnter={() => setIsAutoPlaying(false)}
        >
          ◀
        </button>

        {/* Dots indicators */}
        <div className="flex space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary scale-125'
                  : 'bg-muted hover:bg-primary/50'
              }`}
              onMouseEnter={() => setIsAutoPlaying(false)}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={nextTestimonial}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg"
          onMouseEnter={() => setIsAutoPlaying(false)}
        >
          ▶
        </button>
      </div>

      {/* Auto-play indicator */}
      <div className="text-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          {isAutoPlaying ? '⏸️ Pausar' : '▶️ Reproducir'} rotación automática
        </button>
      </div>
    </section>
  );
};

export default TestimonialsSection;