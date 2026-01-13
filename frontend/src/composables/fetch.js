const API_URL = import.meta.env.VITE_API_URL

class ProductService {
  async getProducts(category = null) {
    try {
      const response = await fetch(
        `${API_URL}/api/products${category ? `?category=${category}` : ''}`,
      )

      let data
      if (!response.ok) {
        data = await response.json()
        return data
      } else {
        data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  async sellProducts(productId, quantity = null) {
    try {
      const response = await fetch(`${API_URL}/api/products/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      })
      let data
      if (!response.ok) {
        data = await response.json()
        return data
      } else {
        data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  async deleteProducts(productId) {
    console.log('product id to delete', productId)

    try {
      const response = await fetch(`${API_URL}/api/products/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })
      let data
      if (!response.ok) {
        data = await response.json()
        return data
      } else {
        data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  async createProduct(productData) {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      console.log('response', response)
      let data
      if (!response.ok) {
        data = await response.json()
        console.log('data err', data)
        return data
      } else {
        data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  async updateProduct(productData) {
    try {
      const response = await fetch(`${API_URL}/api/products/${productData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      let data
      if (!response.ok) {
        data = await response.json()
        return data
      } else {
        data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  async searchProducts(keyword) {
    try {
      const response = await fetch(
        `${API_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`,
      )
      let data
      if (!response.ok) {
        data = await response.json()
        return data
      } else {
        data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  async getCategoryDropdown() {
    try {
      const response = await fetch(`${API_URL}/api/categories`)
      console.log('res', response)

      let data
      if (!response.ok) {
        data = await response.json()
        return data
      } else {
        data = await response.json()
        console.log('cate res data', data);
        
        return data
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
}

const productService = new ProductService()

export default productService

// export { getProducts, getCategoryDropdown };
