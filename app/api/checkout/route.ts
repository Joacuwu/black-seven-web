import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Interfaz para tipar el producto del carrito y eliminar el error de 'any'
interface CartItem {
  id?: string | number;
  name?: string;
  size?: string;
  price?: string | number;
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("Falta la variable MERCADOPAGO_ACCESS_TOKEN en el entorno.");
      return NextResponse.json(
        { error: "Error de configuración en las credenciales de pago." },
        { status: 500 }
      );
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío o el formato es incorrecto" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Mapeo utilizando la interfaz CartItem
    const formattedItems = items.map((item: CartItem, index: number) => {
      const rawPrice = String(item.price || "0").replace(/[^0-9]/g, "");
      const parsedPrice = Number(rawPrice) || 1000;

      return {
        id: String(item.id || index + 1),
        title: `${item.name || "Producto BLACK SEVEN"} (Talle ${item.size || "M"})`,
        unit_price: parsedPrice,
        quantity: 1,
        currency_id: "ARS",
      };
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: formattedItems,
        back_urls: {
          success: `${baseUrl}/seguimiento?status=success`,
          failure: `${baseUrl}/seguimiento?status=failure`,
          pending: `${baseUrl}/seguimiento?status=pending`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Error creando pago Mercado Pago:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el pago" },
      { status: 500 }
    );
  }
}