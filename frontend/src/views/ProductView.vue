<script setup>
import ProductList from '@/components/ProductList.vue';
import { 
  IconPackage 
} from '@tabler/icons-vue';
</script>
 
<template>
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-14 items-center">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center">
            <IconPackage size="32" color="black" />
          </div>
          <span class="text-sm md:text-xl font-bold tracking-tight text-gray-900">
            PRODUCT MANAGEMENT <span class="text-gray-400 font-light">SYSTEM</span>
          </span>
        </div>
      </div>
    </div>
  </nav>
  <div class="p-10 shadow-sm">
    <ProductList />
  </div>
</template>
 
<style scoped>

</style>