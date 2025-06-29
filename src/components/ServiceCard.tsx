import React from 'react';
import { AnimatedCard } from './AnimatedCard';
import { AnimatedButton } from './AnimatedButton';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  icon: string;
  popular?: boolean;
  onSelect: () => void;
  selected?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  description,
  price,
  originalPrice,
  icon,
  popular = false,
  onSelect,
  selected = false
}) => {
  return (
    <AnimatedCard
      animation="fadeInUp"
      className={`relative p-6 bg-card border rounded-2xl shadow-elegant hover:shadow-xl transition-all duration-300 cursor-pointer ${
        selected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5' 
          : 'border-border hover:border-primary/50'
      } ${
        popular ? 'ring-2 ring-primary/30' : ''
      }`}
      onClick={onSelect}
    >
      {/* Badge para servicios populares */}
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            ⭐ MÁS POPULAR
          </span>
        </div>
      )}

      {/* Icono del servicio */}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
        selected 
          ? 'bg-gradient-to-br from-primary to-accent' 
          : 'bg-gradient-to-br from-muted to-card'
      } transition-all duration-300`}>
        <span className={`text-2xl ${selected ? 'text-primary-foreground' : 'text-foreground'}`}>
          {icon}
        </span>
      </div>

      {/* Nombre del servicio */}
      <h3 className={`text-xl font-heading font-bold text-center mb-3 transition-colors duration-300 ${
        selected ? 'text-primary' : 'text-foreground'
      }`}>
        {name}
      </h3>

      {/* Descripción */}
      <p className="text-muted-foreground text-center mb-4 text-sm leading-relaxed min-h-[40px]">
        {description}
      </p>

      {/* Precios */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <span className={`text-2xl font-bold transition-colors duration-300 ${
            selected ? 'text-primary' : 'text-foreground'
          }`}>
            ${price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              ${originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        {originalPrice && (
          <div className="text-xs text-destructive font-medium mt-1">
            ¡Ahorrás ${(originalPrice - price).toLocaleString()}!
          </div>
        )}
      </div>

      {/* Botón de selección */}
      <AnimatedButton
        className={`w-full transition-all duration-300 ${
          selected
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {selected ? '✓ SELECCIONADO' : 'ELEGIR SERVICIO'}
      </AnimatedButton>

      {/* Indicador visual de selección */}
      {selected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground text-sm">✓</span>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
};

export default ServiceCard;