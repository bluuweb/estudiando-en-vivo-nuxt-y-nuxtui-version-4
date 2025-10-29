<script setup lang="ts">
const route = useRoute();
const token = route.query.token;

const { data: isValid, error } = await useFetch(
  "/api/user/verify-token-email",
  {
    method: "POST",
    body: { token },
  }
);

if (error.value || !isValid.value) {
  // Mostrar error o redirigir
  throw createError({
    statusCode: 400,
    message: "Token inválido o expirado",
  });
}
</script>

<template>
  <div>
    <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
      <UPageCard
        class="w-full max-w-md"
        title="Email Verified"
        subtitle="Your email has been successfully verified."
      >
        <template #footer>
          <button
            @click="navigateTo('/login')"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </template>
      </UPageCard>
    </div>
  </div>
</template>
