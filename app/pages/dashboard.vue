<script setup lang="ts">
definePageMeta({
  middleware: "authenticated",
});

const { user, clear: clearSession } = useUserSession();

async function logout() {
  await clearSession();
  await navigateTo("/login");
}

// TODO: Tipar la cookie
// TODO: Averiguar "use server" en nuxt
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
