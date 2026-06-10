export type CreateUserRequest = {
  email: string;

  full_name: string;

  phone: string;

  company_id: string;

  can_deliver?: boolean;


  role:
    | "super_admin"
    | "company_admin"
    | "courier"
    | "seller";
};

export async function createUser(
  payload: CreateUserRequest,
) {

  const response =
    await fetch(
      "/api/users",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
      "Error creando usuario",
    );
  }

  return data;

}