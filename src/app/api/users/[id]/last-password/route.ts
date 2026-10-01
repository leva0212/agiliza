export async function GET() {
  return Response.json({ message: "Las contraseñas temporales no se almacenan ni se pueden consultar." }, { status: 410 });
}
