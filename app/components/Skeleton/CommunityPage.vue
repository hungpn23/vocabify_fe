<template>
  <UContainer>
    <div class="mt-4 space-y-4">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:place-content-end sm:items-center"
      >
        <div class="flex w-full items-center justify-end gap-4">
          <!-- Search -->
          <USkeleton class="h-8 w-48 rounded-md" />
          <!-- Filter -->
          <USkeleton class="h-8 w-32 rounded-md" />
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:gap-4">
        <div v-for="n in 5" :key="n">
           <!-- Mimic UCard structure roughly with skeleton -->
           <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="flex items-center gap-2">
                   <USkeleton class="h-6 w-48" />
                   <USkeleton class="h-5 w-5" />
                </div>
                <div class="flex justify-start sm:justify-end">
                   <USkeleton class="h-4 w-32" />
                </div>
              </div>
              <div class="mt-4 flex gap-2">
                 <USkeleton class="h-5 w-12" />
                 <USkeleton class="h-5 w-12" />
                 <USkeleton class="h-5 w-12" />
                 <USkeleton class="h-5 w-12" />
              </div>
              <USkeleton class="mt-4 h-2 w-full" />
           </div>
        </div>
      </div>

      <div class="mt-4 flex place-content-center">
        <div class="flex justify-center gap-2">
          <USkeleton v-for="p in 5" :key="p" class="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  </UContainer>
</template>
