<script setup lang="ts">
import type { LoginSchemaType } from "#shared/zod/login.schema";
import { loginSchema } from "#shared/zod/login.schema";
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();
const serverError = ref<string | undefined>(undefined);

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Correo",
    placeholder: "Introduce tu correo",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "Introduce tu contraseña",
    required: true,
  },
  {
    name: "remember",
    label: "Recuérdame",
    type: "checkbox",
  },
];

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: () => {
      toast.add({ title: "Google", description: "Login with Google" });
    },
  },
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    onClick: () => {
      toast.add({ title: "GitHub", description: "Login with GitHub" });
    },
  },
];

async function onSubmit(payload: FormSubmitEvent<LoginSchemaType>) {
  try {
    serverError.value = undefined;

    const response = await $fetch("/api/login", {
      method: "POST",
      body: {
        email: payload.data.email,
        password: payload.data.password,
      },
    });
    toast.add({ title: "Success", description: "Login successful" });
    console.log({ response });
  } catch (error) {
    if (error instanceof Error && "statusMessage" in error) {
      console.log(typeof error);
      // toast.add({ title: "Error", description: error.statusMessage });
      serverError.value = error.statusMessage as string;
      toast.add({
        title: "Error",
        description: error.statusMessage as string,
        color: "error",
      });
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="loginSchema"
        :fields="fields"
        :providers="providers"
        title="Login to your account"
        icon="i-lucide-lock"
        @submit="onSubmit"
      >
        <template #description>
          Don't have an account?
          <ULink
            to="/register"
            class="text-primary font-medium"
            >Sign up</ULink
          >.
        </template>
        <template #password-hint>
          <ULink
            to="#"
            class="text-primary font-medium"
            tabindex="-1"
            >Forgot password?</ULink
          >
        </template>
        <template #validation>
          <UAlert
            v-if="serverError"
            color="error"
            icon="i-lucide-info"
            :title="serverError"
          />
        </template>
        <template #footer>
          By signing in, you agree to our
          <ULink
            to="#"
            class="text-primary font-medium"
            >Terms of Service</ULink
          >.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
