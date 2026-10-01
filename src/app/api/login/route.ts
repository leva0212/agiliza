export async function POST() {
  return Response.json({ message: "Usa el inicio de sesión actual." }, { status: 410 });
}
