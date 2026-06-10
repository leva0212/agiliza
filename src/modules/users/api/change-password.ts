export async function changePassword(
  password: string,
) {

  const response =
    await fetch(

      "/api/change-password",

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

        },

        body:
          JSON.stringify({

            password,

          }),

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