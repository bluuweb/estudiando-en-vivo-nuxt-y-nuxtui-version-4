<script setup lang="ts">
const { user } = useUserSession();
</script>

<template>
  <div>Navbar: {{ user?.email }}</div>
</template>
