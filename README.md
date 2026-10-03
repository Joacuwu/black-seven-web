# BLACK SEVEN — Tienda online

🇬🇧 [Read in English](README.en.md)

E-commerce de indumentaria (remeras, buzos, camperas y conjuntos) con catálogo, carrito, checkout, seguimiento de pedidos y un panel de administración pensado para manejarse desde el celular.

<!-- Agregar acá una captura de pantalla: ![Home](docs/screenshots/home.png) -->

**Demo:** _(agregar enlace si está desplegado)_

## Funcionalidades

### Tienda
- Catálogo con búsqueda, página de colección y detalle de producto con talles y guía de talles.
- Carrito lateral y lista de favoritos (estado global con Context API).
- Checkout con pago por **transferencia bancaria** y envío del comprobante por WhatsApp. El pago online con tarjeta (Naranja X) está implementado y se activa con una bandera de configuración.
- Seguimiento de pedido por número y email (`/seguimiento`).
- Emails transaccionales de pedido con Resend.
- SEO: `sitemap.xml`, `robots.txt`, imagen Open Graph dinámica y páginas legales (términos, privacidad, envíos y devoluciones).

### Panel de administración (`/admin`)
- Login con contraseña y cookie de sesión firmada (HMAC), `httpOnly`, con vencimiento de 12 horas.
- **Pedidos:** cambio de estado (esperando transferencia → pagado → preparando → enviado → entregado / cancelado), código de seguimiento y aviso al cliente por mail.
- **Productos:** alta, edición y baja, con subida de imágenes y control de stock.
- **Portada y anuncios:** gestión del hero (con reordenamiento) y de la barra de anuncios.
- Guía de uso para quien administra la tienda: [docs/GUIA-PANEL.md](docs/GUIA-PANEL.md).

### Seguridad y robustez
- Límite de intentos por IP guardado en la base de datos, para que valga con varias instancias del servidor.
- Comparación de credenciales en tiempo constante (`timingSafeEqual`).
- El precio y el stock se calculan en el servidor, no se confía en lo que manda el cliente.
- Webhook de pago validado con secreto.

## Tecnologías

| Área | Herramientas |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS 4 |
| Animaciones e íconos | Framer Motion, Lucide |
| Base de datos | Supabase (PostgreSQL) |
| Emails | Resend |
| Pagos | Transferencia + Naranja X (opcional) |
| Despliegue | Vercel |

## Estructura del proyecto

```
app/            Páginas y API routes (tienda, checkout, admin, webhooks)
components/     Componentes de la tienda y del panel (components/admin)
context/        Carrito, favoritos y productos
lib/            Lógica de negocio: pedidos, precios, stock, auth, pagos, emails
supabase/       Scripts SQL (esquema, productos, hero, anuncios, stock y límites)
docs/           Documentación para quien administra la tienda
public/         Imágenes y recursos estáticos
```

## Instalación local

Requisitos: Node.js 20 o superior y un proyecto de Supabase.

```bash
git clone https://github.com/Joacuwu/black-seven-web.git
cd black-seven-web
npm install
```

1. En el **SQL Editor** de Supabase ejecutá los scripts de la carpeta `supabase/`. Empezá por `schema.sql` y seguí con `products.sql`, `hero.sql`, `announcements.sql` y `stock-y-limites.sql`.
2. Creá un archivo `.env.local` en la raíz con las variables de la tabla siguiente.
3. Levantá el servidor de desarrollo:

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Uso | Obligatoria |
|---|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor, nunca al cliente) | Sí |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin` | Sí |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (mails, sitemap, metadatos) | Recomendada |
| `RESEND_API_KEY` | Envío de emails de pedido | Para enviar mails |
| `ADMIN_EMAIL` | Email del administrador | Opcional |
| `NARANJAX_API_URL`, `NARANJAX_CLIENT_ID`, `NARANJAX_CLIENT_SECRET`, `NARANJAX_WEBHOOK_SECRET` | Pago online con Naranja X | Solo si se activa el pago online |

## Configuración de la tienda

Los datos de cobro (cuenta bancaria, alias, WhatsApp) y la activación del pago online están en [`lib/payment-config.ts`](lib/payment-config.ts).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación |
| `npm run lint` | Revisa el código con ESLint |

## Autor

**Joaquín** — [@Joacuwu](https://github.com/Joacuwu)
