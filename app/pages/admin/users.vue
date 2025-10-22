<script setup lang="ts">
definePageMeta({
  middleware: "authenticated",
  layout: "dashboard-layout",
});
</script>

<template>
  <UDashboardPanel
    id="users"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Users">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div
        class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto"
      >
        <div>
          <h1 class="text-2xl font-semibold">User Management</h1>
          <p class="text-gray-600">Manage your application's users here.</p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
