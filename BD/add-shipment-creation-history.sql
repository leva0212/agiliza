-- Registra automáticamente el primer evento del historial al crear un envío.
-- Funciona para cualquier alta de envío, incluso si en el futuro se crea desde otra pantalla o integración.

CREATE OR REPLACE FUNCTION public.record_shipment_creation_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.shipment_status_history (
    shipment_id,
    previous_status,
    status,
    notes,
    created_by
  ) VALUES (
    NEW.id,
    NULL,
    NEW.status,
    'Envío creado.',
    auth.uid()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS record_shipment_creation_history ON public.shipments;

CREATE TRIGGER record_shipment_creation_history
AFTER INSERT ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.record_shipment_creation_history();
