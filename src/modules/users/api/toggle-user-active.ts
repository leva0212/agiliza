export async function toggleUserActive(

  profileId: string,

  active: boolean,

) {

  const response =
    await fetch(

      "/api/users/toggle-active",

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

        },

        body:
          JSON.stringify({

            profileId,

            active,

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