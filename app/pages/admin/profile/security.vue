<script setup lang="ts">
import type { NuxtError } from "#app";
import type { PasswordSchemaType } from "#shared/zod/password.schema";
import { passwordSchema } from "#shared/zod/password.schema";

const toast = useToast();

const loading = ref(false);

const password = reactive<Partial<PasswordSchemaType>>({
  current: undefined,
  new: undefined,
});

const { data: userDB, refresh } = useFetch("/api/user/profile");
// const accounts = computed(() => userDB.value?.accounts || []);

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

// Método para eliminar una cuenta vinculada
const unlinkAccount = async (accountId: number) => {
  try {
    loading.value = true;
    await $fetch(`/api/user/account`, {
      method: "DELETE",
      body: { accountId },
    });

    toast.add({
      title: "Success",
      description: "The linked account has been removed.",
      icon: "i-lucide-check",
      color: "success",
    });

    // Actualizar la lista de cuentas vinculadas manualmente (opcional)
    // const index = userDB.value!.accounts.findIndex(
    //   (account) => account.id === accountId
    // );
    // if (index !== -1) {
    //   userDB.value!.accounts.splice(index, 1);
    // }

    // Esta es la forma donde volvemos a cargar los datos del usuario
    // osea se vuelve a ejecutar el fetch /api/user/profile
    await refresh();
  } catch (error) {
    console.log({ error });
    const err = error as NuxtError;
    toast.add({
      title: "Error",
      description: err.statusMessage || "Failed to unlink account 🚩",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
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
      title="Cuentas Vinculadas"
      description="Administra tus cuentas vinculadas a servicios externos."
      variant="subtle"
    >
      <div class="flex flex-col gap-4">
        <section
          v-for="account in userDB?.accounts"
          :key="account.id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="`i-simple-icons-${
                account.provider === 'email' ? 'maildotru' : account.provider
              }`"
              class="size-5"
            />
            <span class="capitalize">{{ account.provider }}</span>
          </div>
          <!-- <UButton
            label="Desvincular"
            color="error"
            @click="unlinkAccount(account.id)"
          /> -->
          <UModal
            title="¿Eliminar cuenta?"
            description="Esta acción es permanente y no se puede revertir."
          >
            <!-- El botón que abre el modal -->
            <UButton
              label="Eliminar cuenta"
              color="error"
              :loading="loading"
              :disabled="userDB!.accounts.length <= 1"
            />

            <!-- Contenido del modal -->
            <template #footer="{ close }">
              <div class="flex gap-2 justify-end">
                <UButton
                  label="Cancelar"
                  color="neutral"
                  variant="outline"
                  @click="close"
                />
                <UButton
                  label="Confirmar eliminación"
                  color="error"
                  @click="
                    unlinkAccount(account.id);
                    close();
                  "
                />
              </div>
            </template>
          </UModal>
        </section>
      </div>
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
  </div>
</template>
