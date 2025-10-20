<script setup lang="ts">
definePageMeta({
  middleware: "authenticated",
  layout: "dashboard-layout",
});

const { user, clear: clearSession, fetch } = useUserSession();

async function logout() {
  await clearSession();
  await fetch(); // Refresca el estado de la sesión del usuario
  await navigateTo("/login");
}
</script>

<template>
  <div>
    <h1
      class="text-center text-2xl"
      v-if="user"
    >
      Dashboard: {{ user.name }} - {{ user.email }}
    </h1>
    <p>Welcome to your dashboard!</p>
    <u-button @click="logout">Logout</u-button>
  </div>
</template>
