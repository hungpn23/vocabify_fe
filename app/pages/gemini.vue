<template>
  <div class="mx-auto max-w-2xl p-8">
    <h3 class="mb-6 text-xl font-semibold text-gray-800">{{ question }}</h3>

    <div class="flex flex-col gap-3">
      <UButton
        v-for="(answer, index) in answers"
        :key="index"
        :label="answer.text"
        :class="getButtonClass(index)"
        @click="handleAnswer(index)"
        :disabled="answered"
        block
      />
    </div>
  </div>
</template>

<script setup>
const question = ref('Thủ đô của Việt Nam là gì?');
const answers = ref([
  { text: 'Hà Nội', isCorrect: true },
  { text: 'Hồ Chí Minh', isCorrect: false },
  { text: 'Đà Nẵng', isCorrect: false },
  { text: 'Hải Phòng', isCorrect: false },
]);

const selectedIndex = ref(null);
const answered = ref(false);

const handleAnswer = (index) => {
  if (answered.value) return;

  selectedIndex.value = index;
  answered.value = true;
};

const getButtonClass = (index) => {
  // Chưa trả lời - tất cả button đều có style mặc định
  if (!answered.value) {
    return '!border-2 !border-gray-300 hover:!border-gray-400 transition-all';
  }

  // Đã trả lời
  const isSelected = index === selectedIndex.value;
  const isCorrectAnswer = answers.value[index].isCorrect;

  // Nếu là ô được chọn
  if (isSelected) {
    // Trả lời đúng -> border xanh
    if (isCorrectAnswer) {
      return '!border-2 !border-green-500 !bg-green-50';
    }
    // Trả lời sai -> border đỏ
    return '!border-2 !border-red-500 !bg-red-50';
  }

  // Nếu không phải ô được chọn
  // Nhưng là đáp án đúng (khi user chọn sai) -> border xanh
  if (isCorrectAnswer && !answers.value[selectedIndex.value].isCorrect) {
    return '!border-2 !border-green-500 !bg-green-50';
  }

  // Các ô còn lại -> giữ nguyên, opacity giảm
  return '!border-2 !border-gray-300 opacity-60';
};
</script>

<style scoped>
/* Không cần custom CSS nữa, đã dùng Tailwind */
</style>
