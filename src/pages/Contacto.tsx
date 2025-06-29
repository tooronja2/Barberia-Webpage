
import SEOHead from "@/components/SEOHead";
import { useBusiness } from "@/context/BusinessContext";

const Contacto = () => {
  const { config } = useBusiness();

  return (
    <>
      <SEOHead
        title={`Contacto | ${config?.nombre_negocio}`}
        description={config?.meta_descripcion}
      />
      <main className="max-w-2xl mx-auto pt-14 bg-background text-foreground">
        <h1 className="text-3xl font-heading font-bold mb-6 text-light-DEFAULT">Contacto</h1>
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <b className="text-light-DEFAULT">Teléfono:</b> <a href={`tel:${config?.telefono_contacto}`} className="text-gold-DEFAULT hover:underline">{config?.telefono_contacto}</a>
          </div>
          <div>
            <b className="text-light-DEFAULT">Email:</b> <a href={`mailto:${config?.email_contacto}`} className="text-gold-DEFAULT hover:underline">{config?.email_contacto}</a>
          </div>
          <div>
            <b className="text-light-DEFAULT">Dirección:</b> {config?.direccion_fisica}
          </div>
          <div>
            <b className="text-light-DEFAULT">WhatsApp:</b> <a href={`https://wa.me/${config?.whatsapp_numero.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-gold-DEFAULT hover:underline">{config?.whatsapp_numero}</a>
          </div>
        </div>
        <div>
          {/* Schema.org Org Markup */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": config?.nombre_negocio,
              "url": window.location.origin,
              "logo": config?.seo_configuracion?.og_image,
              "contactPoint": [{
                "@type": "ContactPoint",
                "telephone": config?.telefono_contacto,
                "email": config?.email_contacto,
                "contactType": "customer service"
              }],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": config?.direccion_fisica
              }
            })
          }} />
        </div>
      </main>
    </>
  );
};

export default Contacto;
