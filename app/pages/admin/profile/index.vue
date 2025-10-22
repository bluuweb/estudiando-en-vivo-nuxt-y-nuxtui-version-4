<script setup lang="ts">
import type { NuxtError } from "#app";
import type { ProfileSchemaType } from "#shared/zod/profile.schema";
import { ProfileSchema } from "#shared/zod/profile.schema";
import type { FormSubmitEvent } from "@nuxt/ui";
// import type { User } from "~/generated/prisma";

// Aquí nos traemos la sesión del usuario
const { user, fetch: refreshSession } = useUserSession();

// Pero también podríamos traernos los datos del perfil desde nuestra API
// const { data: userDB } = await useFetch<User>("/api/user/profile");

const profileState = reactive<Partial<ProfileSchemaType>>({
  username: user?.value?.name || "",
});

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<ProfileSchemaType>) {
  try {
    await $fetch("/api/user/profile", {
      method: "PUT",
      body: event.data,
    });
    toast.add({
      title: "Success",
      description: "Your settings have been updated.",
      icon: "i-lucide-check",
      color: "success",
    });

    // Refrescamos la sesión para obtener los nuevos datos del usuario en el frontend
    await refreshSession();
  } catch (error) {
    const err = error as NuxtError;
    toast.add({
      title: "Error",
      description: err.statusMessage || "Profile failed 🚩",
      color: "error",
    });
  }

  console.log(event.data);
}
</script>

<template>
  <UForm
    id="settingForm"
    @submit="onSubmit"
    :schema="ProfileSchema"
    :state="profileState"
  >
    <UPageCard
      variant="subtle"
      class="mb-4"
    >
      {{ user }}
    </UPageCard>

    <UPageCard
      title="Profile Form"
      description="Update your profile information."
      orientation="horizontal"
      class="mb-4"
      variant="subtle"
    >
      <UButton
        form="settingForm"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      >
        Save Changes
      </UButton>
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="username"
        label="Username"
        description="This is your public username."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profileState.username"
          autocomplete="off"
        />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
