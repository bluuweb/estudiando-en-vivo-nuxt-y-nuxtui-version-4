<script setup lang="ts">
import type { NuxtError } from "#app";
import type { ProfileSchemaType } from "#shared/zod/profile.schema";
import { ProfileSchema } from "#shared/zod/profile.schema";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { User } from "@prisma/client";

const { user, fetch: refreshSession } = useUserSession();
const { data: userDB } = await useFetch<User>("/api/user/profile");

const profileState = reactive<Partial<ProfileSchemaType>>({
  username: user?.value?.name || "",
  avatar: userDB.value?.avatar || "",
  bio: userDB.value?.bio || "",
});

const toast = useToast();
const fileRef = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);

const onSubmit = async (event: FormSubmitEvent<ProfileSchemaType>) => {
  try {
    // 1. Si hay una imagen nueva, subirla primero
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append("avatar", selectedFile.value);

      const response = await $fetch("/api/user/upload-avatar", {
        method: "PUT",
        body: formData,
      });

      // Actualizar el estado con la URL del servidor
      event.data.avatar = response.url;
    }

    // 2. Actualizar el perfil con todos los datos
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

    // Refrescar la sesión
    await refreshSession();

    // Limpiar el archivo seleccionado
    selectedFile.value = null;
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

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  const file = input.files[0]!;
  selectedFile.value = file;

  // Mostrar preview local
  profileState.avatar = URL.createObjectURL(file);
}

function onFileClick() {
  fileRef.value?.click();
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

      <USeparator />
      <UFormField
        name="avatar"
        label="Avatar"
        description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="profileState.avatar"
            :alt="profileState.username"
            size="lg"
          />
          <UButton
            label="Choose"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          />
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="Bio"
        description="Brief description for your profile. URLs are hyperlinked."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea
          v-model="profileState.bio"
          :rows="5"
          autoresize
          class="w-full"
        />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
