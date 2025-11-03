<script setup lang="ts">
import type { NuxtError } from "#app";
import type { ChangePasswordSchemaType } from "#shared/zod/change-password.schema";
import { changePasswordSchema } from "#shared/zod/change-password.schema";

const route = useRoute();
const token = route.query.token;

const { data: isValid, error } = await useFetch("/api/user/verify-token", {
  query: { token },
});

if (error.value || !isValid.value) {
  // Mostrar error o redirigir
  throw createError({
    statusCode: 400,
    message: "Token inválido o expirado",
  });
}

const toast = useToast();
const password = ref<string>("");

const onSubmit = async (event: { data: ChangePasswordSchemaType }) => {
  try {
    await $fetch("/api/user/change-token-password", {
      method: "POST",
      body: {
        token,
        newPassword: event.data.password,
      },
    });
    toast.add({
      title: "Success",
      description: "Password changed successfully.",
      icon: "i-lucide-check",
      color: "success",
    });

    setTimeout(() => {
      navigateTo("/login");
    }, 1500);
  } catch (error) {
    console.log({ error });
    const err = error as NuxtError;
    console.log({ superError: err.statusMessage });
    toast.add({
      title: "Error",
      description: err.statusMessage || "Failed to send reset link 🚩",
      color: "error",
    });
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
    <UPageCard
      class="w-full max-w-md"
      title="Forgot Password"
      description="Enter your email to receive a password reset link."
      variant="subtle"
    >
      <UForm
        :schema="changePasswordSchema"
        :state="{ password }"
        class="flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UFormField name="password">
          <UInput
            v-model="password"
            type="password"
            placeholder="Enter your new password"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          class="w-full"
          >Change Password</UButton
        >
      </UForm>
    </UPageCard>
  </div>
</template>
