<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import productService from '@/composables/fetch.js'
import Swal from 'sweetalert2'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import {
  IconDatabaseOff,
  IconPackageOff,
  IconEdit,
  IconTrash,
  IconTrashFilled,
  IconX,
  IconTrashX,
  IconShoppingBag,
  IconBasket,
  IconReceipt,
  IconFlame,
  IconShoppingBagCheck,
  IconPackageExport,
  IconCheck,
} from '@tabler/icons-vue'
import SearchBar from './SearchBar.vue'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { useCategoryStore } from '@/stores/category'
import Select from 'primevue/select'
// import Button from 'primevue/button'

const categoryStore = useCategoryStore()

const products = ref([])

const isLoading = ref(false)

const isFilteredCate = ref('All Categories')

const handleCategory = async (category) => {
  if (category) {
    isFilteredCate.value = category
    products.value = await productService.getProducts(category)
    console.log('filtered products', products.value)
  } else {
    products.value = await productService.getProducts()
  }
}
const handleKeyword = async (keyword) => {
  if (keyword && keyword.trim() !== '') {
    const result = await productService.searchProducts(keyword)
    products.value = result.data
    console.log('search products', products.value)
  } else {
    console.log('reset search')
    products.value = await productService.getProducts()
  }
}

onMounted(async () => {
  isLoading.value = true
  products.value = await productService.getProducts()
  categoriesOptions.value = categoryStore.categories
  console.log('cateopt', categoriesOptions.value)

  isLoading.value = false
  console.log('product list', products.value)
  Swal.fire({
    title: 'Data Retrieved!',
    text: `Retrieved ${products.value.length} products successfully!`,
    icon: 'success',
    timer: 1500,
    showConfirmButton: true,
  })
})

const confirmDelete = (product) => {
  console.log('confirm delete', product)
  Swal.fire({
    title: 'Are you sure to delete?',
    icon: 'warning',
    showCancelButton: true,
    // confirmButtonColor: 'lightseagreen',
    cancelButtonColor: 'red',
    confirmButtonText: 'Delete',
  }).then(async (result) => {
    if (result.isConfirmed) {
      await productService.deleteProducts(product._id)
      selectedProducts.value = []
      handleCategory(isFilteredCate.value)
      Swal.fire({
        title: 'Deleted!',
        text: `Product ${product.SKU} has been deleted.`,
        icon: 'success',
      })
    }
  })
}

const sellProduct = async (product) => {
  try {
    Swal.fire({
      title: 'Please enter sell quantity.',
      input: 'number',
      inputAttributes: {
        min: 1,
      },
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      showLoaderOnConfirm: true,
      keydownListenerCapture: true,
      preConfirm: async (quantity) => {
        try {
          console.log('qty', quantity, product._id)
          const res = await productService.sellProducts(product._id, quantity)
          if (res.error) {
            throw new Error(res.error)
          }
        } catch (error) {
          Swal.showValidationMessage(`${error}`)
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: `${result.value} ${product.name} sold successfully!`,
          icon: 'success',
          showConfirmButton: true,
        }).then(() => {
          handleCategory(isFilteredCate.value)
        })
      }
    })
  } catch (error) {
    console.error('Failed:', error)
  }
}
const selectedProducts = ref([])

const isNewProduct = ref(false)
const submitted = ref(false)

const editProductDialog = ref(false)
const productToEdit = ref({})

const editProduct = (prod) => {
  console.log('edit clicked', prod)

  productToEdit.value = { ...prod }
  console.log('to edit', productToEdit.value)

  editProductDialog.value = true
  isNewProduct.value = false
  submitted.value = false
}

const hideDialog = () => {
  editProductDialog.value = false
  submitted.value = false
}

const categoriesOptions = ref([])
console.log('categoriesOptions', categoriesOptions)

const selectedCategory = computed({
  get: () => {
    return productToEdit.value.category ? productToEdit.value.category.id : null
  },
  set: (value) => {
    const selectedCate = categoriesOptions.value.find((cate) => cate.id === value)
    productToEdit.value.category = selectedCate ? { ...selectedCate } : null
  },
})

watch(selectedCategory, (newVal) => {
  console.log('Selected category in edit dialog:', newVal)
})

const dupError = ref('')

watch(productToEdit, (newVal) => {
  console.log('edited val', newVal);
  if (newVal) dupError.value = ''
}, { deep: true })

const saveProduct = async () => {
  console.log('prod to add', productToEdit.value)
  submitted.value = true

  const isInvalid =
    !productToEdit.value.SKU ||
    productToEdit.value.SKU.length < 3 ||
    !productToEdit.value.name ||
    !productToEdit.value.category ||
    productToEdit.value.price === null ||
    productToEdit.value.price <= 0 ||
    productToEdit.value.stock === null ||
    productToEdit.value.stock <= 0

  if (isInvalid) {
    console.warn('Validation failed: Please fill all required fields.')
    return
  }
  try {
    if (isNewProduct.value) {
      const dataToSend = {
        SKU: productToEdit.value.SKU,
        name: productToEdit.value.name,
        category: productToEdit.value.category,
        price: productToEdit.value.price,
        stock: productToEdit.value.stock,
      }

      const res = await productService.createProduct(dataToSend)
      console.log('res', res);
      
      if (res.errors) {
        dupError.value = res.errors[0]
        return dupError.value
      } else {
        Swal.fire({
          title: 'Success',
          text: 'Product created successfully!',
          icon: 'success',
        })
  
        // Refresh product list
        handleCategory(isFilteredCate.value)
        hideDialog()
        return
      }

    }

    // Call API to save product
    await productService.updateProduct(productToEdit.value)

    Swal.fire({
      title: 'Success',
      text: 'Product updated successfully!',
      icon: 'success',
    })

    // Refresh product list
    handleCategory(isFilteredCate.value)
    hideDialog()
  } catch (error) {
    console.error('Save failed:', error)
    // Swal.fire({
    //   title: 'Error',
    //   text: 'Failed to update product.',
    //   icon: 'error',
    // })
  }
}

watch(selectedProducts, (newVal) => {
  console.log('Selected products:', newVal)
})

const rowClass = (data) => {
  if (data.stock === 0) {
    return 'bg-red-50 text-red-900'
  }
  return ''
}

const getSeverity = (stock) => {
  if (stock === 0) return 'secondary'
  if (stock < 10) return 'danger'
  if (stock < 30) return 'warn'
  return 'success'
}

const formatCurrency = (value) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'THB' })
}

const totalPrices = computed(() => {
  let total = 0
  for (let product of products.value) {
    total += product.stock * product.price
  }

  return formatCurrency(total)
})

const addProduct = () => {
  productToEdit.value = {
    SKU: '',
    name: '',
    category: null,
    price: 0,
    stock: 0,
  }
  editProductDialog.value = true
  submitted.value = false
  isNewProduct.value = true
}
</script>

<template>
  <SearchBar
    @update:category="handleCategory"
    @update:keyword="handleKeyword"
    @addProduct="addProduct"
    class="pb-4"
  />
  <div class="card mx-auto radius-lg">
    <div class="pb-2 cursor-pointer text-red-500" v-if="selectedProducts.length > 0">
      <button
        v-if="selectedProducts.length > 0"
        class="p-button-danger p-button-outlined h-10 cursor-pointer px-3 flex items-center gap-2"
        @click="confirmDelete({ SKU: 'Selected Items', _id: selectedProducts.map((p) => p._id) })"
      >
        <IconTrashFilled size="18" />
        <span class="text-sm">Delete Selected({{ selectedProducts.length }})</span>
      </button>
    </div>
    <DataTable
      v-model:selection="selectedProducts"
      :value="products"
      :rowClass="rowClass"
      responsiveLayout="scroll"
      removableSort
      stripedRows
      paginator
      :rows="5"
      :loading="isLoading"
      tableStyle="min-width: 50rem"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    >
      <template #empty>
        <div class="flex flex-col items-center justify-center p-8 text-gray-500">
          <IconPackageOff size="48" class="mb-4" />
          <p class="text-lg">No products found.</p>
          <span class="text-sm">Try adjusting your filters or adding new items.</span>
        </div>
      </template>

      <Column selectionMode="multiple" style="width: 3rem" :exportable="false" />
      <Column field="SKU" header="Product Code (SKU)" style="width: 20%" sortable />
      <Column field="name" header="Product Name" style="width: 25%" sortable />
      <Column field="category.name" header="Category" style="width: 20%" sortable />
      <Column field="price" header="Price (THB)" style="width: 15%" sortable>
        <template #body="slotProps"> {{ formatCurrency(slotProps.data.price) }} </template>
      </Column>
      <Column field="stock" header="Stock" style="width: 10%" sortable>
        <template #body="slotProps">
          <Tag :value="slotProps.data.stock" :severity="getSeverity(slotProps.data.stock)" />
        </template>
      </Column>
      <Column header="Actions" style="width: 10%">
        <template #body="slotProps">
          <div class="flex gap-4">
            <button
              :disabled="slotProps.data.stock === 0"
              class="cursor-pointer"
              @click="sellProduct(slotProps.data)"
            >
              <IconShoppingBagCheck v-if="slotProps.data.stock > 0" class="text-green-300" />
              <IconPackageOff class="text-black cursor-not-allowed" v-else />
            </button>

            <button class="cursor-pointer" @click="editProduct(slotProps.data)">
              <IconEdit />
            </button>

            <button class="text-red-500 cursor-pointer" @click="confirmDelete(slotProps.data)">
              <IconTrash />
            </button>
          </div>
        </template>
      </Column>
      <!-- <ColumnGroup type="footer" v-if="!isFilteredCate.includes('All') && products.length > 0">
        <Row>
          <Column footer="Total Products:" :colspan="0" footerStyle="text-align:right" />
          <Column
            :footer="products.length.toString()"
            footerStyle="text-align:left; font-weight:bold;"
          />
          <Column :colspan="0" />
        </Row>

        <Row>
          <Column footer="Total Values:" :colspan="4" footerStyle="text-align:right" />
          <Column
            :footer="totalPrices"
            :colspan="0"
            footerStyle="text-align:left; color: green; font-weight:bold;"
          />
        </Row>
      </ColumnGroup> -->
    </DataTable>
  </div>
  <div v-if="!isFilteredCate.includes('All') && products.length > 0">
    <div
      class="w-full pt-2 border-t border-gray-300 flex flex-col sm:flex-row justify-end md:gap-6 pr-4"
    >
      <p>
        Total Products: <span class="text-yellow-500">{{ products.length }}</span>
      </p>
      <p>
        Total Stock Values: <span class="text-green-300">{{ totalPrices }}</span>
      </p>
    </div>
  </div>
  <Dialog
    v-model:visible="editProductDialog"
    :style="{ width: '450px' }"
    header="Product Details"
    :modal="true"
    :baseZIndex="1000"
  >
    <div class="flex flex-col gap-6">
      <div>
        <label for="sku" class="block font-bold mb-3">SKU</label>
        <InputText
          id="sku"
          v-model.trim="productToEdit.SKU"
          :disabled="!isNewProduct"
          autofocus
          fluid
        />
        <small v-if="submitted && !productToEdit.SKU" class="text-red-500">SKU is required.</small>
        <small v-else-if="submitted && productToEdit.SKU.length < 3" class="text-red-500"
          >SKU must be at least 3 characters long.</small
        >
        <small v-else-if="submitted && dupError" class="text-red-500"
          >SKU is alerady exist.</small
        >
      </div>
      <div>
        <label for="name" class="block font-bold mb-3">Name</label>
        <InputText id="name" v-model.trim="productToEdit.name" autofocus fluid />
        <small v-if="submitted && !productToEdit.name" class="text-red-500"
          >Name is required.</small
        >
      </div>

      <div>
        <span class="block font-bold mb-4">Category</span>
        <div class="grid">
          <Select
            v-model="selectedCategory"
            :options="categoriesOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Category"
            class="w-full h-10"
            checkmark
            :highlightOnSelect="true"
          />
          <small v-if="submitted && !productToEdit.category" class="text-red-500"
            >Category is required.</small
          >
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
          <label for="price" class="block font-bold mb-3">Price</label>
          <InputNumber
            id="price"
            v-model="productToEdit.price"
            :min="0"
            mode="currency"
            currency="THB"
            locale="en-US"
            fluid
          />
          <small v-if="submitted && productToEdit.price === 0" class="text-red-500"
            >Price is required.</small
          >
        </div>
        <div class="col-span-6">
          <label for="stock" class="block font-bold mb-3">Stock Quantity</label>
          <InputNumber id="stock" :min="0" v-model="productToEdit.stock" integeronly fluid />
          <small v-if="submitted && productToEdit.stock === 0" class="text-red-500"
            >Stock is required.</small
          >
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <button
          @click="saveProduct(productToEdit)"
          class="cursor-pointer border-2 rounded-lg p-1.5 bg-green-300 text-black hover:bg-green-400 transition duration-500"
        >
          Save
        </button>
        <button
          text
          @click="hideDialog"
          class="cursor-pointer border-2 rounded-lg p-1.5 bg-red-300 text-black hover:bg-red-400 transition duration-500"
        >
          Cancel
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.bg-red-50) {
  background-color: lightcoral !important;
}
</style>
