export async function resetUserPassword(
  profileId: string,
) {

  const response =
    await fetch(
      "/api/users/reset-password",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({

            profileId,

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