
import { useBusiness } from "@/context/BusinessContext";
import { Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const { config } = useBusiness();
  if (!config) return null;

  return (
    <footer className="w-full border-t border-primary bg-background">
      <div className="max-w-5xl mx-auto py-7 px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-semibold text-md text-primary">
          {config.nombre_negocio} &copy; {new Date().getFullYear()}
        </span>
        <div className="flex gap-4">
          {config.footer_links.map((l, i) => (
            <a key={i} href={l.url} className="hover:underline text-sm font-semibold text-muted-foreground hover:text-primary">
              {l.texto}
            </a>
          ))}
          <Link to="/gestion" className="hover:underline text-sm font-semibold text-muted-foreground hover:text-primary">
            Iniciar Sesión
          </Link>
        </div>
        <div className="flex gap-3">
          {config.links_redes_sociales.instagram && (
            <a href={config.links_redes_sociales.instagram} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-6 w-6 text-gold-DEFAULT" />
            </a>
          )}
          {config.links_redes_sociales.facebook && (
            <a href={config.links_redes_sociales.facebook} target="_blank" rel="noopener noreferrer">
              <Facebook className="h-6 w-6 text-gold-DEFAULT" />
            </a>
          )}
          {/* Si hay Tiktok, podrías poner un "?" o dejar vacío */}
          {config.links_redes_sociales.tiktok && (
            <a href={config.links_redes_sociales.tiktok} target="_blank" rel="noopener noreferrer">
              {/* No hay icono oficial, se deja un placeholder o texto */}
              <span className="font-semibold text-xs text-gold-DEFAULT">TikTok</span>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
