const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

router.post('/api/products', async (req, res) => {
  try {
    const { SKU, name, price, stock, category } = req.body;
    const errors = [];

    if (!name || name.trim() === '') {
      errors.push('Product name must not be empty');
    }

    if (!SKU || SKU.trim() === '') {
      errors.push('SKU must not be empty');
    } else if (SKU.length < 3) {
      errors.push('SKU must be at least 3 characters long');
    } else {
      const existingSKU = await Product.findOne({ SKU });
      if (existingSKU) {
        errors.push('SKU must not be duplicated');
      }
    }

    if (!price || price <= 0) {
      errors.push('Product price must be greater than 0');
    } else if (price <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (!stock || stock < 0) {
      errors.push('Stock must not be negative');
    }

    if (!category) {
      errors.push('Category can\'t be empty');
    } else {
      const categoryExists = await Category.findOne(category);
      console.log('cat', categoryExists);
      if (!categoryExists) {
        errors.push('Category does not exist');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        errors: errors 
      });
    }

    const product = new Product(req.body);
    const data = await product.save();
    res.status(201).json({
      message: 'Product created successfully',
      data: data
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});

router.get('/api/products', async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.category && !req.query.category.includes('All')) {
      filter['category.name'] = req.query.category;
    }
    
    const data = await Product.find(filter);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/api/products/delete', async (req, res) => {
  const idsToDelete = req.body.productId;
  try {

    console.log('ids to delete', idsToDelete);
    
    if (idsToDelete.length === 0) {
      return res.status(400).json({ message: 'No product IDs provided for deletion' });
    }

    const data = await Product.deleteMany({ _id: { $in: idsToDelete } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    console.log('update data', updateData);
    

    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/api/categories', async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
    const categories = data.map(cat => {
      return { value: cat.id, label: cat.name };
    });
    console.log('cate', categories);
    return categories;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/api/products/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    const errors = [];

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ errors: ['keyword must not be empty'] });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    }

    const filter = {
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { SKU: { $regex: keyword, $options: 'i' } }
      ]
    };

    const data = await Product.find(filter);

    res.json({
      keyword: keyword,
      totalResults: data.length,
      data: data
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});

router.post('/api/products/sell', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const errors = [];

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Quantity can\'t be empty and must be greater than 0' 
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: `Stock not sufficient (only ${product.stock} item(s) left in stock)` 
      });
    }

    product.stock = product.stock - quantity;
    const updatedProduct = await product.save();

    res.json({
      message: 'Sell product successfully',
      data: updatedProduct
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});


module.exports = router;