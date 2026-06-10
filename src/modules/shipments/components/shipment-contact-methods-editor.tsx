"use client";

import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import DeleteIcon
  from "@mui/icons-material/Delete";

import {
  CreateShipmentContactMethodInput,
} from "../types/shipment-contact-method";

type Props = {
  value:
    CreateShipmentContactMethodInput[];

  onChange: (
    value:
      CreateShipmentContactMethodInput[],
  ) => void;
};

export function ShipmentContactMethodsEditor({
  value,
  onChange,
}: Props) {

  function addPhone() {

    onChange([

      ...value,

      {
  contact_name: "",
  contact_type: "customer",
  relationship: "",
  can_receive: true,

  method_type: "phone",
  value: "",
  label: "",
  is_primary: value.length === 0,
  notes: "",
}

    ]);
  }

  function addEmail() {

    onChange([

      ...value,

      {
  contact_name: "",
  contact_type: "customer",
  relationship: "",
  can_receive: true,

  method_type: "email",
  value: "",
  label: "",
  is_primary: value.length === 0,
  notes: "",
}

    ]);
  }

  function updateItem(
    index: number,
    field:
      keyof CreateShipmentContactMethodInput,
    fieldValue:
  string | boolean
  ) {

    const updated =
      [...value];

    updated[index] = {

      ...updated[index],

      [field]:
        fieldValue,

    };

    onChange(
      updated,
    );
  }

  function removeItem(
    index: number,
  ) {

    onChange(

      value.filter(
        (_,
         i) =>
          i !== index,
      ),

    );
  }

  return (

    <Stack
      spacing={2}
    >

      {/* INICIO BOTONES */}

      <Stack
        direction="row"
        spacing={1}
      >

        <Button
          variant="outlined"
          onClick={
            addPhone
          }
        >
          Agregar teléfono
        </Button>

        <Button
          variant="outlined"
          onClick={
            addEmail
          }
        >
          Agregar correo
        </Button>

      </Stack>

      {/* FIN BOTONES */}

      {/* INICIO ITEMS */}

      {

        value.map(
          (
            item,
            index,
          ) => (

            <Stack
              key={index}
              spacing={2}
              sx={{
                border:
                  "1px solid #ddd",
                p: 2,
                borderRadius:
                  1,
              }}
            >

              <TextField
                select
                fullWidth
                label="Tipo"
                value={
                  item.method_type
                }
                onChange={
                  event =>
                    updateItem(
                      index,
                      "method_type",
                      event.target.value,
                    )
                }
              >

                <MenuItem
                  value="phone"
                >
                  Teléfono
                </MenuItem>

                <MenuItem
                  value="email"
                >
                  Correo
                </MenuItem>

              </TextField>

              <TextField
                fullWidth
                label="Valor"
                value={
                  item.value
                }
                onChange={
                  event =>
                    updateItem(
                      index,
                      "value",
                      event.target.value,
                    )
                }
              />

              <TextField
                fullWidth
                label="Label"
                value={
                  item.label
                }
                onChange={
                  event =>
                    updateItem(
                      index,
                      "label",
                      event.target.value,
                    )
                }
              />

              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Observaciones"
                value={
                  item.notes
                }
                onChange={
                  event =>
                    updateItem(
                      index,
                      "notes",
                      event.target.value,
                    )
                }
              />

              <TextField
                select
                fullWidth
                label="Principal"
                value={
                  item.is_primary
                    ? "true"
                    : "false"
                }
                onChange={
                  event =>
                    updateItem(
                      index,
                      "is_primary",
                      event.target.value ===
                        "true",
                    )
                }
              >

                <MenuItem
                  value="true"
                >
                  Sí
                </MenuItem>

                <MenuItem
                  value="false"
                >
                  No
                </MenuItem>

              </TextField>

              <Stack
  direction="row"
  sx={{
    justifyContent:
      "flex-end",
  }}
>

                <IconButton
                  color="error"
                  onClick={
                    () =>
                      removeItem(
                        index,
                      )
                  }
                >
                  <DeleteIcon />
                </IconButton>

              </Stack>

            </Stack>

          ),
        )

      }

      {/* FIN ITEMS */}

    </Stack>

  );
}