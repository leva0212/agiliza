"use client";

import { useParams } from "next/navigation";

import {
  ProductForm,
} from "@/modules/products/components/product-form";

export default function EditProductPage() {

  const params =
    useParams();

  return (

    <ProductForm
      productId={
        params.id as string
      }
    />

  );

}