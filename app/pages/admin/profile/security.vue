<script setup lang="ts">
import type { NuxtError } from "#app";
import type { PasswordSchemaType } from "#shared/zod/password.schema";
import { passwordSchema } from "#shared/zod/password.schema";

const toast = useToast();

const password = reactive<Partial<PasswordSchemaType>>({
  current: undefined,
  new: undefined,
});

// ⭐ Esto nos sirve para validar antes de enviar el formulario, en caso de hacer validaciones extras a Zod
// const validate = (state: Partial<PasswordSchemaType>): FormError[] => {
//   const errors: FormError[] = [];
//   if (state.current && state.new && state.current === state.new) {
//     errors.push({ name: "new", message: "Passwords must be different" });
//   }
//   return errors;
// };

const onSubmit = async (event: { data: Partial<PasswordSchemaType> }) => {
  try {
    await $fetch("/api/user/update-password", {
      method: "PUT",
      body: event.data,
    });

    toast.add({
      title: "Success",
      description: "Your password has been updated.",
      icon: "i-lucide-check",
      color: "success",
    });

    // Limpiar el formulario
    password.current = "";
    password.new = "";
  } catch (error) {
    console.log({ error });
    const err = error as NuxtError;
    toast.add({
      title: "Error",
      description: err.statusMessage || "Profile failed 🚩",
      color: "error",
    });
  }
};
</script>

<template>
  <UPageCard
    title="Password"
    description="Confirm your current password before setting a new one."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      class="flex flex-col gap-4 max-w-xs"
      @submit="onSubmit"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          type="password"
          placeholder="Current password"
          class="w-full"
        />
      </UFormField>

      <UFormField name="new">
        <UInput
          v-model="password.new"
          type="password"
          placeholder="New password"
          class="w-full"
        />
      </UFormField>

      <UButton
        label="Update"
        class="w-fit"
        type="submit"
      />
    </UForm>
  </UPageCard>
  <UPageCard
    title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton
        label="Delete account"
        color="error"
      />
    </template>
  </UPageCard>
</template>
