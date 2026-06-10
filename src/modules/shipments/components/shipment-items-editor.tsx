"use client";

import { Button, IconButton, MenuItem, Stack, TextField } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import type { CreateShipmentItemInput } from "../types/shipment-item";

import type { CompanyProductOption } from "@/modules/company-products/types/company-product-option";

type Props = {
  products: CompanyProductOption[];

  value: CreateShipmentItemInput[];

  onChange: (value: CreateShipmentItemInput[]) => void;
};

export function ShipmentItemsEditor({ products, value, onChange }: Props) {
  function addItem() {
    onChange([
      ...value,

      {
        product_id: "",

        quantity: 1,

        deposit_amount: 0,

        shipping_fee: 0,

        serial_number: "",

        barcode: "",

        notes: "",
      },
    ]);
  }

  function updateItem(
    index: number,
    field: keyof CreateShipmentItemInput,
    fieldValue: any,
  ) {
    const updated = [...value];

    updated[index] = {
      ...updated[index],

      [field]: fieldValue,
    };

    onChange(updated);
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);

    const updated = [...value];

    updated[index] = {
      ...updated[index],

      product_id: productId,

      deposit_amount: product?.default_deposit ?? 0,

      shipping_fee: product?.default_shipping_fee ?? 0,
    };

    onChange(updated);
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <Stack spacing={2}>
      <Button variant="outlined" onClick={addItem}>
        Agregar producto
      </Button>

      {value.map((item, index) => (
        <Stack
          key={index}
          spacing={2}
          sx={{
            border: "1px solid #ddd",
            p: 2,
            borderRadius: 1,
          }}
        >
          <TextField
            select
            fullWidth
            label="Producto"
            value={item.product_id}
            onChange={(event) => selectProduct(index, event.target.value)}
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Cantidad"
            value={item.quantity}
            onChange={(event) =>
              updateItem(index, "quantity", Number(event.target.value))
            }
          />

          <TextField
            type="number"
            label="Depósito"
            value={item.deposit_amount}
            onChange={(event) =>
              updateItem(index, "deposit_amount", Number(event.target.value))
            }
          />

          <TextField
            type="number"
            label="Costo por envío"
            value={item.shipping_fee}
            onChange={(event) =>
              updateItem(index, "shipping_fee", Number(event.target.value))
            }
          />

          <TextField
            label="Serie"
            value={item.serial_number ?? ""}
            onChange={(event) =>
              updateItem(index, "serial_number", event.target.value)
            }
          />

          <TextField
            label="Código barras"
            value={item.barcode ?? ""}
            onChange={(event) =>
              updateItem(index, "barcode", event.target.value)
            }
          />

          <TextField
            multiline
            minRows={2}
            label="Notas"
            value={item.notes ?? ""}
            onChange={(event) => updateItem(index, "notes", event.target.value)}
          />

          <Stack
            direction="row"
            sx={{
              justifyContent: "flex-end",
            }}
          >
            <IconButton color="error" onClick={() => removeItem(index)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
