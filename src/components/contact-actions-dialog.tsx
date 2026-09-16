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
            className="w-full rounded-xl border border-slate-200/60 p-3 text-left transition-colors hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 dark:border-slate-700/40 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-900/60 dark:hover:text-blue-100 dark:active:bg-blue-800/70"
          >
            📞 Llamar
          </button>

          <button
            type="button"
            onClick={() =>
              window.open(`https://wa.me/506${cleanPhone}`, "_blank")
            }
            className="w-full rounded-xl border border-slate-200/60 p-3 text-left transition-colors hover:bg-green-50 hover:text-green-700 active:bg-green-100 dark:border-slate-700/40 dark:bg-green-950/30 dark:text-green-100 dark:hover:bg-green-900/60 dark:hover:text-green-100 dark:active:bg-green-800/70"
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
            className="w-full rounded-xl border border-slate-200/60 p-3 text-left transition-colors hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 dark:border-slate-700/40 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-100 dark:active:bg-emerald-800/70"
          >
            📝 WhatsApp con mensaje
          </button>

          <button
            type="button"
            onClick={() => window.open(`sms:${cleanPhone}`)}
            className="w-full rounded-xl border border-slate-200/60 p-3 text-left transition-colors hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100 dark:border-slate-700/40 dark:bg-indigo-950/30 dark:text-indigo-100 dark:hover:bg-indigo-900/60 dark:hover:text-indigo-100 dark:active:bg-indigo-800/70"
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
            className="w-full rounded-xl border border-slate-200/60 p-3 text-left transition-colors hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 dark:border-slate-700/40 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:text-white dark:active:bg-slate-600"
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
            transition-colors
            hover:bg-gray-100
            dark:hover:bg-slate-700/70
            dark:hover:text-white
          "
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
