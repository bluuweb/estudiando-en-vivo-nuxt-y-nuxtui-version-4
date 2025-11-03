export default defineEventHandler(async (event) => {
  // Crear un contador de 10 segundos para evitar multiples solicitudes
  await new Promise((resolve) => setTimeout(resolve, 10000));

  return { message: "Counter finished" };
});
