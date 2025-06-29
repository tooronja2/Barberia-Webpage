
import React from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const { config } = useBusiness();

  if (!config) return null;

  return (
    <footer className="bg-gradient-to-br from-card to-background border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Información de la barbería */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
                {config.nombre_negocio?.toUpperCase() || "BARBERÍA CENTRAL"}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                Donde el estilo cobra vida. Más de 25 años brindando servicios de barbería 
                de excelencia en General Rodríguez, Buenos Aires.
              </p>
            </div>

            {/* Redes sociales */}
            <div>
              <h4 className="text-lg font-heading font-semibold text-foreground mb-3">
                🌐 REDES SOCIALES
              </h4>
              <div className="flex space-x-4">
                {config.links_redes_sociales?.facebook && (
                  <a 
                    href={config.links_redes_sociales.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-muted hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label="Facebook"
                  >
                    <span className="text-lg">📘</span>
                  </a>
                )}
                {config.links_redes_sociales?.instagram && (
                  <a 
                    href={config.links_redes_sociales.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-muted hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label="Instagram"
                  >
                    <span className="text-lg">📷</span>
                  </a>
                )}
                <a 
                  href={`https://wa.me/${config.telefono_contacto?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                  aria-label="WhatsApp"
                >
                  <span className="text-lg">💬</span>
                </a>
                {config.links_redes_sociales?.tiktok && (
                  <a 
                    href={config.links_redes_sociales.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-muted hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label="TikTok"
                  >
                    <span className="text-lg">🎵</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-foreground mb-4">
              📞 CONTACTO
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-primary text-lg">📱</span>
                <div>
                  <div className="text-foreground font-medium">{config.telefono_contacto}</div>
                  <div className="text-sm text-muted-foreground">Llamadas y WhatsApp</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-primary text-lg">📧</span>
                <div>
                  <div className="text-foreground font-medium">{config.email_contacto}</div>
                  <div className="text-sm text-muted-foreground">Email</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-primary text-lg">📍</span>
                <div>
                  <div className="text-foreground font-medium">{config.direccion_fisica}</div>
                  <div className="text-sm text-muted-foreground">General Rodríguez, Buenos Aires</div>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios y Enlaces */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-foreground mb-4">
              🕒 HORARIOS
            </h4>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lunes - Viernes</span>
                <span className="text-foreground font-medium">9:00 - 19:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sábados</span>
                <span className="text-foreground font-medium">9:00 - 17:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Domingos</span>
                <span className="text-destructive font-medium">Cerrado</span>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h5 className="text-sm font-heading font-semibold text-foreground mb-3 uppercase tracking-wide">
                Enlaces Rápidos
              </h5>
              <div className="space-y-1">
                <Link 
                  to="/servicios" 
                  className="block text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Servicios
                </Link>
                <Link 
                  to="/reservar-turno" 
                  className="block text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Reservar Turno
                </Link>
                <Link 
                  to="/contacto" 
                  className="block text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Contacto
                </Link>
                {config.footer_links?.map((link, i) => (
                  <a 
                    key={i}
                    href={link.url}
                    className="block text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.texto}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} <span className="text-primary font-medium">{config.nombre_negocio}</span>. 
                Todos los derechos reservados.
              </p>
            </div>

            {/* Insignias de calidad */}
            <div className="flex items-center space-x-6 text-center">
              <div className="text-center">
                <div className="text-primary font-bold">⭐⭐⭐⭐⭐</div>
                <div className="text-xs text-muted-foreground">5.0 Estrellas</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-bold">25+</div>
                <div className="text-xs text-muted-foreground">Años</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-bold">1000+</div>
                <div className="text-xs text-muted-foreground">Clientes</div>
              </div>
            </div>

            {/* Link de gestión */}
            <div>
              <Link 
                to="/gestion" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Gestión
              </Link>
            </div>
          </div>
        </div>

        {/* Mensaje adicional */}
        <div className="text-center mt-6 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground font-accent">
            🔥 Reservá tu turno online las 24hs • 
            📱 Confirmación inmediata por WhatsApp • 
            ✨ Ambiente único en General Rodríguez
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
