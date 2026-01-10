import { defineStore } from "pinia";
import { ref } from "vue";
import productService from "@/composables/fetch.js";

export const useCategoryStore = defineStore("category", () => {
  const categories = ref([]);

  const fetchCategories = async () => {
    const data = await productService.getCategoryDropdown();
    categories.value = data;
  };

  return { categories, fetchCategories };
});
