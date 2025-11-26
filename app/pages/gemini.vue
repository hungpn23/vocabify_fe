<script setup>
import { ref, onMounted } from 'vue';
import { defineShortcuts } from '#imports';

// Tạo 10 input
const items = Array.from({ length: 10 });

// Lấy danh sách refs từ v-for
const refs = useTemplateRefsList();

// Index hiện tại
const currentIndex = ref(0);

// Focus theo index
const focusByIndex = () => {
  const el = refs.value[currentIndex.value];
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus();
  }
};

// Khi mount xong, focus input đầu
onMounted(() => {
  focusByIndex();
  console.log('🚀 ~ refs:', refs.value.length);
});

// Định nghĩa phím tắt
defineShortcuts({
  // ← previous input

  arrowleft: {
    handler: () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
        console.log('🚀 ~ currentIndex:', currentIndex.value);
        focusByIndex();
      }
    },
    usingInput: true, // Cho phép sử dụng khi focus trong input
  },
  // → next input
  arrowright: {
    handler: () => {
      if (currentIndex.value < refs.value.length - 1) {
        currentIndex.value++;
        console.log('🚀 ~ currentIndex:', currentIndex.value);
        focusByIndex();
      }
    },
    usingInput: true, // Cho phép sử dụng khi focus trong input
  },
});
</script>

<template>
  <div class="flex snap-y flex-col gap-64 scroll-smooth">
    <input
      v-for="(_, i) in items"
      :key="i"
      :ref="refs.set"
      :placeholder="`Input ${i + 1}`"
      class="w-64 snap-center rounded border p-2"
      type="text"
    />
  </div>
</template>
