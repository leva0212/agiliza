export function getRoleLabel(
  role: string,
) {

  switch (role) {

    case "super_admin":
      return "✅Administrativo del sistema";

    case "company_admin":
      return "Operativo";

    case "courier":
      return "Mensajero";
    case "seller":
  return "Vendedor";

    default:
      return role;

  }

}
