export function getDefaultRolePermissions(
  role: string,
): string[] {

  switch (role) {

    case "super_admin":
      return [
        "manage_companies",
        "manage_users",
        "manage_coverage",
        "manage_routes",
        "assign_routes",
        "manage_couriers",
        "create_shipments",
        "edit_shipments",
        "cancel_shipments",
        "view_company_shipments",
        "view_all_shipments",
        "view_reports",
        "update_delivery_status",
        "upload_delivery_evidence",
        "update_route_coverage",
        "manage_tariffs",
        "manage_system_settings",
        "view_users",
        "reset_passwords",
      ];

    case "company_admin":
      return [
        "create_shipments",
        "edit_shipments",
        "cancel_shipments",
        "view_company_shipments",
        "view_reports",
        "view_users",
      ];

    case "seller":
      return [
        "create_shipments",
        "edit_shipments",
        "view_company_shipments",
      ];

    case "courier":
      return [
        "update_delivery_status",
        "upload_delivery_evidence",
      ];

    default:
      return [];
  }

}