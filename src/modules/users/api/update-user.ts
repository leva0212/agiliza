export type UpdateUserRequest = {

  id: string;

  company_id: string | null;

  full_name: string;

  phone: string | null;

  role: string;

  active: boolean;
  
  can_deliver: boolean;


};

export async function updateUser(
  payload: UpdateUserRequest,
) {

  const response =
    await fetch(

      `/api/users/${payload.id}`,

      {

        method: "PUT",

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
      data.message,
    );

  }

  return data;

}