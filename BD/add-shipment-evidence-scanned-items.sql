BEGIN;

-- Metadatos obtenidos localmente al analizar una foto de evidencia.
ALTER TABLE public.shipment_evidences
  ADD COLUMN IF NOT EXISTS shipment_item_id uuid NULL REFERENCES public.shipment_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS detected_barcode text NULL,
  ADD COLUMN IF NOT EXISTS detected_text text NULL,
  ADD COLUMN IF NOT EXISTS detected_company_code text NULL,
  ADD COLUMN IF NOT EXISTS company_mismatch_justification text NULL;

CREATE INDEX IF NOT EXISTS shipment_evidences_scanned_barcode_idx
  ON public.shipment_evidences (detected_barcode)
  WHERE detected_barcode IS NOT NULL;

-- Cada fila representa un artículo identificable. La importación masiva futura
-- creará filas con status = available; al entregar quedan en status = delivered.
CREATE TABLE IF NOT EXISTS public.inventory_serialized_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text NOT NULL UNIQUE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  detected_company_id uuid NULL REFERENCES public.companies(id) ON DELETE SET NULL,
  product_id uuid NULL REFERENCES public.products(id) ON DELETE SET NULL,
  inventory_id uuid NULL REFERENCES public.inventory(id) ON DELETE SET NULL,
  courier_id uuid NULL REFERENCES public.couriers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'delivered', 'voided')),
  delivered_shipment_id uuid NULL REFERENCES public.shipments(id) ON DELETE SET NULL,
  delivered_shipment_item_id uuid NULL REFERENCES public.shipment_items(id) ON DELETE SET NULL,
  delivered_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_serialized_items_inventory_status_idx
  ON public.inventory_serialized_items (inventory_id, status);

-- Auditoría por evidencia: conserva el código leído, la empresa detectada y el
-- resultado de la comparación, incluso cuando excepcionalmente no coinciden.
CREATE TABLE IF NOT EXISTS public.shipment_scanned_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  shipment_item_id uuid NOT NULL REFERENCES public.shipment_items(id) ON DELETE RESTRICT,
  shipment_company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  evidence_id uuid NOT NULL REFERENCES public.shipment_evidences(id) ON DELETE RESTRICT,
  inventory_serialized_item_id uuid NULL REFERENCES public.inventory_serialized_items(id) ON DELETE SET NULL,
  inventory_id uuid NULL REFERENCES public.inventory(id) ON DELETE SET NULL,
  barcode text NOT NULL,
  detected_company_code text NULL,
  detected_company_id uuid NULL REFERENCES public.companies(id) ON DELETE SET NULL,
  validation_status text NOT NULL CHECK (validation_status IN ('matched', 'company_mismatch', 'company_unrecognized', 'barcode_reused')),
  exception_justification text NULL,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  scanned_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE (evidence_id)
);

CREATE INDEX IF NOT EXISTS shipment_scanned_items_shipment_idx
  ON public.shipment_scanned_items (shipment_id, scanned_at DESC);

ALTER TABLE public.inventory_serialized_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_scanned_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.inventory_serialized_items FROM anon, authenticated;
REVOKE ALL ON public.shipment_scanned_items FROM anon, authenticated;

-- La transacción existente que confirma la entrega ya descuenta el inventario.
-- Este trigger agrega el rastro de las unidades escaneadas sin descontar dos veces.
CREATE OR REPLACE FUNCTION public.register_delivered_evidence_scans()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  evidence_row record;
  inventory_row record;
  serial_row record;
  detected_company uuid;
  result_status text;
BEGIN
  IF OLD.status = 'delivered' OR NEW.status <> 'delivered' THEN
    RETURN NEW;
  END IF;

  FOR evidence_row IN
    SELECT evidence.id, evidence.shipment_item_id, trim(evidence.detected_barcode) AS barcode,
           nullif(trim(evidence.detected_company_code), '') AS detected_company_code,
           nullif(trim(evidence.company_mismatch_justification), '') AS company_mismatch_justification,
           evidence.created_by
      FROM public.shipment_evidences evidence
     WHERE evidence.shipment_id = NEW.id
       AND evidence.deleted_at IS NULL
       AND evidence.shipment_item_id IS NOT NULL
       AND nullif(trim(evidence.detected_barcode), '') IS NOT NULL
  LOOP
    -- Si la misma evidencia ya fue procesada, no se duplica el historial.
    IF EXISTS (SELECT 1 FROM public.shipment_scanned_items scan WHERE scan.evidence_id = evidence_row.id) THEN
      CONTINUE;
    END IF;

    SELECT inventory.id, item.product_id
      INTO inventory_row
      FROM public.shipment_items item
      LEFT JOIN public.inventory inventory
        ON inventory.courier_id = NEW.delivered_by_courier_id
       AND inventory.company_id = NEW.company_id
       AND inventory.product_id = item.product_id
     WHERE item.id = evidence_row.shipment_item_id
       AND item.shipment_id = NEW.id;

    -- La foto no se asocia a un artículo de otro envío.
    IF inventory_row.product_id IS NULL THEN
      CONTINUE;
    END IF;

    detected_company := NULL;
    IF evidence_row.detected_company_code ~ '^0[0-9]{2}$' THEN
      SELECT company.id
        INTO detected_company
        FROM public.companies company
       WHERE upper(company.code) = 'DTS' || evidence_row.detected_company_code
       LIMIT 1;
    END IF;

    SELECT serial.id, serial.status, serial.company_id, serial.delivered_shipment_id
      INTO serial_row
      FROM public.inventory_serialized_items serial
     WHERE serial.barcode = evidence_row.barcode
     FOR UPDATE;

    IF serial_row.id IS NOT NULL
       AND serial_row.status = 'delivered'
       AND serial_row.delivered_shipment_id IS DISTINCT FROM NEW.id THEN
      result_status := 'barcode_reused';
    ELSIF detected_company IS NULL AND evidence_row.detected_company_code IS NOT NULL THEN
      result_status := 'company_unrecognized';
    ELSIF detected_company IS NOT NULL AND detected_company IS DISTINCT FROM NEW.company_id THEN
      result_status := 'company_mismatch';
    ELSIF serial_row.id IS NOT NULL AND serial_row.company_id IS DISTINCT FROM NEW.company_id THEN
      result_status := 'company_mismatch';
    ELSE
      result_status := 'matched';
    END IF;

    IF result_status = 'company_mismatch'
       AND evidence_row.company_mismatch_justification IS NULL THEN
      RAISE EXCEPTION 'Debe justificar la excepción de empresa distinta antes de confirmar la entrega.';
    END IF;

    IF serial_row.id IS NULL THEN
      INSERT INTO public.inventory_serialized_items (
        barcode, company_id, detected_company_id, product_id, inventory_id,
        courier_id, status, delivered_shipment_id, delivered_shipment_item_id,
        delivered_at, created_by, updated_at
      ) VALUES (
        evidence_row.barcode, NEW.company_id, detected_company, inventory_row.product_id,
        inventory_row.id, NEW.delivered_by_courier_id, 'delivered', NEW.id,
        evidence_row.shipment_item_id, now(), auth.uid(), now()
      ) RETURNING id INTO serial_row.id;
    ELSIF result_status <> 'barcode_reused' THEN
      UPDATE public.inventory_serialized_items
         SET detected_company_id = coalesce(detected_company, detected_company_id),
             product_id = inventory_row.product_id,
             inventory_id = inventory_row.id,
             courier_id = NEW.delivered_by_courier_id,
             status = 'delivered',
             delivered_shipment_id = NEW.id,
             delivered_shipment_item_id = evidence_row.shipment_item_id,
             delivered_at = now(),
             updated_at = now()
       WHERE id = serial_row.id;
    END IF;

    INSERT INTO public.shipment_scanned_items (
      shipment_id, shipment_item_id, shipment_company_id, evidence_id,
      inventory_serialized_item_id, inventory_id, barcode,
      detected_company_code, detected_company_id, validation_status,
      exception_justification, scanned_by
    ) VALUES (
      NEW.id, evidence_row.shipment_item_id, NEW.company_id, evidence_row.id,
      serial_row.id, inventory_row.id, evidence_row.barcode,
      evidence_row.detected_company_code, detected_company, result_status,
      evidence_row.company_mismatch_justification, evidence_row.created_by
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS register_delivered_evidence_scans ON public.shipments;
CREATE TRIGGER register_delivered_evidence_scans
AFTER UPDATE OF status ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.register_delivered_evidence_scans();

NOTIFY pgrst, 'reload schema';
COMMIT;
