export async function getLastPassword(
  profileId: string,
) {

  const response =
    await fetch(

      `/api/users/${profileId}/last-password`,

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