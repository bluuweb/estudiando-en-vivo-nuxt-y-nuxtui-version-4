<script setup lang="ts">
import type { NuxtError } from "#app";
import type { ForgotPasswordSchemaType } from "#shared/zod/forgot-password.schema";
import { forgotPasswordSchema } from "#shared/zod/forgot-password.schema";

const toast = useToast();
const email = ref<string>("");
const loading = ref(false);
const sentEmail = ref(false);

const onSubmit = async (event: { data: ForgotPasswordSchemaType }) => {
  try {
    loading.value = true;
    await $fetch("/api/user/forgot-password", {
      method: "POST",
      body: event.data,
    });
    toast.add({
      title: "Success",
      description: "Password reset link sent to your email.",
      icon: "i-lucide-check",
      color: "success",
    });
    sentEmail.value = true;
    // await $fetch("/api/user/counter");
  } catch (error) {
    console.log({ error });
    const err = error as NuxtError;
    toast.add({
      title: "Error",
      description: err.statusMessage || "Failed to send reset link 🚩",
      color: "error",
    });
  } finally {
    loading.value = false;
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
        :schema="forgotPasswordSchema"
        :state="{ email }"
        class="flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UFormField name="email">
          <UInput
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          class="w-full"
          :loading="loading"
          :disabled="sentEmail"
          >Send Reset Link</UButton
        >
      </UForm>
    </UPageCard>
  </div>
</template>
