export function getRoleLabel(
  role: string,
) {

  switch (role) {

    case "super_admin":
      return "✅Administrador del sistema";

    case "company_admin":
      return "Supervisor";

    case "courier":
      return "Mensajero";
    case "seller":
  return "Vendedor";

    default:
      return role;

  }

}