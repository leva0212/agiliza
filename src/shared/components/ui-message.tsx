type MessageType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "question"
  | "danger";

type Props = {
  open: boolean;

  title: string;

  message: React.ReactNode;

  type?: MessageType;

  cancelText?: string;

  confirmText?: string;

  onClose: () => void;

  onConfirm?: () => void;
};

export function UiMessage({
  open,

  title,

  message,
  cancelText = "Cancelar",
  confirmText = "Confirmar",

  type = "info",

  onClose,

  onConfirm,
}: Props) {
  if (!open) return null;

  const styles = {
    success: {
      icon: "✓",
      box: "bg-green-50 border-green-200 text-green-700",
      button: "bg-green-600",
    },

    error: {
      icon: "✕",
      box: "bg-red-50 border-red-200 text-red-700",
      button: "bg-red-600",
    },

    warning: {
      icon: "⚠",
      box: "bg-yellow-50 border-yellow-200 text-yellow-700",
      button: "bg-yellow-600",
    },

    info: {
      icon: "ℹ",
      box: "bg-blue-50 border-blue-200 text-blue-700",
      button: "bg-blue-600",
    },

    question: {
      icon: "?",
      box: "bg-violet-50 border-violet-200 text-violet-700",
      button: "bg-violet-600",
    },
    danger: {
      icon: "🗑",
      box: "bg-red-50 border-red-300 text-red-700",
      button: "bg-red-600",
    },
  };

  const current = styles[type];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div
        className="
        w-full
        max-w-2xl
        bg-white
        rounded-2xl
        shadow-xl
        border
        animate-fade-in
        flex
        flex-col
        max-h-[85vh]
      "
      >
        {/* CONTENIDO CON SCROLL */}

        <div
          className="
          p-6
          overflow-y-auto
          flex-1
        "
        >
          <div className={`rounded-xl border p-5 ${current.box}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-bold">{current.icon}</div>

              <h2 className="text-lg font-semibold">{title}</h2>
            </div>

            <div className="text-sm">{message}</div>
          </div>
        </div>

        {/* BOTONES FIJOS */}

        <div
          className="
          border-t
          p-4
          bg-white
          rounded-b-2xl
        "
        >
          {type === "question" || type === "danger" ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="
                border
                border-gray-300
                py-3
                rounded-xl
                font-medium
              "
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                className={`
    text-white
    py-3
    rounded-xl
    font-medium
    ${type === "danger" ? "bg-red-600" : "bg-violet-600"}
  `}
              >
                {confirmText}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className={`
              w-full
              text-white
              py-3
              rounded-xl
              font-medium
              ${current.button}
            `}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
