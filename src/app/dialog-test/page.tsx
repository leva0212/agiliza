"use client";

import { useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

const items = [
  "Leo Vargas",
  "Carlos Gómez",
  "Ana Mora",
  "Juan Pérez",
  "María López",
  "Pedro Rojas",
];

export default function DialogTestPage() {
  const nativeDialogRef =
    useRef<HTMLDialogElement>(null);

  const [muiOpen, setMuiOpen] =
    useState(false);

  const [tailwindOpen, setTailwindOpen] =
    useState(false);

  return (
    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-bold">
        Comparación de Diálogos
      </h1>

      <div className="flex flex-wrap gap-4">

        <button
          onClick={() =>
            nativeDialogRef.current?.showModal()
          }
          className="
            px-4
            py-2
            rounded-lg
            bg-blue-600
            text-white
          "
        >
          Dialog Nativo
        </button>

        <button
          onClick={() =>
            setMuiOpen(true)
          }
          className="
            px-4
            py-2
            rounded-lg
            bg-green-600
            text-white
          "
        >
          Material UI Dialog
        </button>

        <button
          onClick={() =>
            setTailwindOpen(true)
          }
          className="
            px-4
            py-2
            rounded-lg
            bg-purple-600
            text-white
          "
        >
          Tailwind Dialog
        </button>

      </div>

      {/* ========================= */}
      {/* DIALOG NATIVO */}
      {/* ========================= */}

      <dialog
        ref={nativeDialogRef}
        className="
          rounded-2xl
          p-0
          w-full
          max-w-md
        "
      >
        <div className="p-4">

          <div className="flex justify-between items-center mb-4">

            <h2 className="font-bold">
              Buscar mensajero
            </h2>

            <button
              onClick={() =>
                nativeDialogRef.current?.close()
              }
            >
              ✕
            </button>

          </div>

          <input
            placeholder="Buscar..."
            className="
              w-full
              border
              rounded-lg
              p-3
              mb-4
            "
          />

          <div className="space-y-2">

            {items.map(
              (item) => (
                <button
                  key={item}
                  className="
                    w-full
                    text-left
                    p-3
                    rounded-lg
                    hover:bg-blue-100
                  "
                >
                  {item}
                </button>
              ),
            )}

          </div>

        </div>
      </dialog>

      {/* ========================= */}
      {/* MATERIAL UI */}
      {/* ========================= */}

      <Dialog
        open={muiOpen}
        onClose={() =>
          setMuiOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Buscar mensajero
        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            label="Buscar"
            sx={{
              mt: 1,
              mb: 2,
            }}
          />

          <List>

            {items.map(
              (item) => (
                <ListItemButton
                  key={item}
                >
                  <ListItemText
                    primary={
                      item
                    }
                  />
                </ListItemButton>
              ),
            )}

          </List>

        </DialogContent>

      </Dialog>

      {/* ========================= */}
      {/* TAILWIND CUSTOM */}
      {/* ========================= */}

      {tailwindOpen && (

        <div
          className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-50
            p-4
          "
          onClick={() =>
            setTailwindOpen(
              false,
            )
          }
        >

          <div
            className="
              bg-white
              rounded-3xl
              shadow-xl
              w-full
              max-w-md
              p-5
            "
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >

            <div
              className="
                flex
                justify-between
                items-center
                mb-4
              "
            >

              <h2 className="font-bold">
                Buscar mensajero
              </h2>

              <button
                onClick={() =>
                  setTailwindOpen(
                    false,
                  )
                }
              >
                ✕
              </button>

            </div>

            <input
              placeholder="Buscar..."
              className="
                w-full
                border
                rounded-lg
                p-3
                mb-4
              "
            />

            <div className="space-y-2">

              {items.map(
                (item) => (
                  <button
                    key={item}
                    className="
                      w-full
                      text-left
                      p-3
                      rounded-lg
                      hover:bg-blue-100
                    "
                  >
                    {item}
                  </button>
                ),
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}