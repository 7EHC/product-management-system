<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCategoryStore } from '@/stores/category'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import { IconSearch, IconPlus, IconSquarePlus } from '@tabler/icons-vue'

const categoryStore = useCategoryStore()

const selectedCategory = ref('All Categories')

const searchKeyword = ref('')

const categoriesOptions = computed(() => {
  const allOption = { name: 'All Categories' }

  return [allOption, ...categoryStore.categories]
})

onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
    console.log('Fetched categories:', categoryStore.categories)
  }
})

const emit = defineEmits(['update:category', 'update:keyword', 'addProduct'])

watch(selectedCategory, (newVal) => {
  if (!newVal) {
    selectedCategory.value = 'All Categories'
  }

  emit('update:category', newVal)
})
// watch(searchKeyword, (newVal) => {
//   if (!newVal) {
//     searchKeyword.value = ''
//   }

//   emit('update:keyword', newVal)
// })
</script>

<template>
  <div>
    <div class="md:flex items-center justify-between w-full card mx-auto">
    <div class="flex md:pb-0 pb-4">
        <p class="mb-2 self-center pr-2">CATEGORY:</p>
        <Select
          v-model="selectedCategory"
          :options="categoriesOptions"
          optionLabel="name"
          optionValue="name"
          placeholder="Select Category"
          class="w-full md:w-44 h-10"
          checkmark
          :highlightOnSelect="true"
        />
    </div>
    <div class="flex gap-2 ml-auto">
        <InputText
        id="keyword"
        v-model.trim="searchKeyword"
        @keydown.enter="$emit('update:keyword', searchKeyword)"
        placeholder="Search products..."
        class="w-full md:w-64 h-10" 
        autofocus
        />
        <IconSearch class="self-center cursor-pointer text-gray-400" @click="$emit('update:keyword', searchKeyword)"/>
    </div>
    <div class="flex ml-auto">
        <button class="p-button-outlined p-button-rounded h-10 ml-2 text-green-300 cursor-pointer duration-300 flex items-center gap-1"
          @click="$emit('addProduct', true)">
          <IconSquarePlus /> New Product
        </button>
    </div>
    </div>
  </div>
</template>
