<script setup lang="ts">
import { UAvatar } from '#components';
import { breakpointsTailwind } from '@vueuse/core';
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

const { status, data } = useAuthState();
const { signOut } = useAuth();
const colorMode = useColorMode();
const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');

const isDarkMode = computed(() => colorMode.value === 'dark');

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/home',
  },
]);

const avatarItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/profile',
    },
    {
      label: isDarkMode.value ? 'Light Mode' : 'Dark Mode',
      icon: isDarkMode.value ? 'i-lucide-sun' : 'i-lucide-moon',
      class: 'cursor-pointer',
      onSelect: toggleColorMode,
    },
    {
      label: 'Settings',
      icon: 'i-lucide-cog',
      to: '/settings',
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: onSignOut,
    },
  ],
]);

function toggleColorMode() {
  colorMode.preference = isDarkMode.value ? 'light' : 'dark';
}

async function onSignOut() {
  await signOut({ callbackUrl: '/' });
}

defineShortcuts({
  '`': toggleColorMode,
});
</script>

<template>
  <UHeader toggle-side="left">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="h-6 w-auto shrink-0" />
      </NuxtLink>
    </template>

    <template #default>
      <UNavigationMenu :items="items" variant="link" />
    </template>

    <template #right>
      <div v-if="status === 'unauthenticated'">
        <UButton
          label="Sign in"
          color="neutral"
          variant="outline"
          to="/login"
          class="mr-2 hidden lg:inline-flex"
        />

        <UButton
          label="Sign up"
          color="neutral"
          trailing-icon="i-lucide-arrow-right"
          class="hidden lg:inline-flex"
          to="/signup"
        />
      </div>

      <div v-else class="flex place-content-between place-items-center gap-1.5">
        <UInput
          v-if="smAndLarger"
          icon="i-lucide-search"
          variant="outline"
          color="neutral"
          placeholder="Search everything..."
        />

        <UButton
          v-else
          icon="i-lucide-search"
          variant="ghost"
          color="neutral"
        />

        <KeyboardShortcuts v-if="smAndLarger" />

        <UColorModeButton v-if="smAndLarger" />

        <UChip inset>
          <UButton icon="i-lucide-bell" variant="ghost" color="neutral" />
        </UChip>

        <UDropdownMenu :items="avatarItems" :content="{ align: 'start' }">
          <UAvatar
            class="squircle rounded-none"
            :src="data?.avatarUrl || ''"
            icon="i-lucide-image"
          />
        </UDropdownMenu>
      </div>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />

      <div v-if="status === 'unauthenticated'">
        <USeparator class="my-6" />

        <UButton
          label="Sign in"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton label="Sign up" color="neutral" to="/signup" block />
      </div>
    </template>
  </UHeader>
</template>
