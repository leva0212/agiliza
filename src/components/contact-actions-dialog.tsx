"use client";

type Props = {
  open: boolean;

  onClose: () => void;

  phone: string;

  customerName?: string;

  trackingNumber?: string;
  companyName?: string;
  provinceName?: string;

  cantonName?: string;

  districtName?: string;

  neighborhoodName?: string;

  customerAddress?: string;
};

export function ContactActionsDialog({
  open,

  onClose,

  phone,

  customerName,

  trackingNumber,
  companyName,
  provinceName,

  cantonName,

  districtName,

  neighborhoodName,

  customerAddress,
}: Props) {
  if (!open) {
    return null;
  }

  const cleanPhone = phone.replace(/\D/g, "");

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Buenos días";
    }

    if (hour < 18) {
      return "Buenas tardes";
    }

    return "Buenas noches";
  }

  const whatsappMessage = encodeURIComponent(
    `${getGreeting()} ${customerName ?? ""},

Te escribo de parte de ${companyName ?? "nuestra empresa"} para coordinar la entrega de su envío ${trackingNumber ?? ""}.

Dirección registrada:

Provincia: ${provinceName ?? "No indicada"}
Cantón: ${cantonName ?? "No indicado"}
Distrito: ${districtName ?? "No indicado"}
Barrio: ${neighborhoodName ?? "No indicado"}
Dirección exacta:
${customerAddress ?? "No indicada"}

Es importante contar con el documento de identidad disponible al momento de la entrega.

¿Podría por favor enviarme su ubicación en tiempo real o la actual para ayudarle con la entrega de forma más rápida y precisa?

Muchas gracias.`,
  );

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/30
        z-50
        flex
        items-center
        justify-center
        p-4
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          p-4
          w-full
          max-w-sm
        "
      >
        <div className="font-bold mb-3">Contacto</div>

        <div className="text-sm text-gray-600 mb-4">{phone}</div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => window.open(`tel:${cleanPhone}`)}
            className="
              w-full
              border
              rounded-xl
              p-3
              text-left
            "
          >
            📞 Llamar
          </button>

          <button
            type="button"
            onClick={() =>
              window.open(`https://wa.me/506${cleanPhone}`, "_blank")
            }
            className="
              w-full
              border
              rounded-xl
              p-3
              text-left
            "
          >
            💬 Abrir WhatsApp
          </button>

          <button
            type="button"
            onClick={() =>
              window.open(
                `https://wa.me/506${cleanPhone}?text=${whatsappMessage}`,
                "_blank",
              )
            }
            className="
              w-full
              border
              rounded-xl
              p-3
              text-left
            "
          >
            📝 WhatsApp con mensaje
          </button>

          <button
            type="button"
            onClick={() => window.open(`sms:${cleanPhone}`)}
            className="
              w-full
              border
              rounded-xl
              p-3
              text-left
            "
          >
            ✉ SMS
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(cleanPhone);
              } catch {
                const input = document.createElement("input");

                input.value = cleanPhone;

                document.body.appendChild(input);

                input.select();

                document.execCommand("copy");

                document.body.removeChild(input);
              }

              onClose();
            }}
            className="
              w-full
              border
              rounded-xl
              p-3
              text-left
            "
          >
            📋 Copiar número
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            mt-4
            w-full
            border
            rounded-xl
            p-3
          "
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
