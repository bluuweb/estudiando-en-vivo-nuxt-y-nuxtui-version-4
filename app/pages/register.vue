<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const toast = useToast();

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

const schema = z.object({
  email: z.email("Email no valido"),
  password: z
    .string("La contraseña es obligatoria")
    .min(6, "Debe tener al menos 6 caracteres"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log({ payload: payload.data.email });
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :providers="providers"
        title="Register a new account"
        icon="i-lucide-lock"
        @submit="onSubmit"
      >
        <template #description>
          Don't have an account?
          <ULink
            to="/login"
            class="text-primary font-medium"
            >Sign in</ULink
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
            color="error"
            icon="i-lucide-info"
            title="Error signing in"
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
