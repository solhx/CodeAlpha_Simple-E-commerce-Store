import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';

// @desc    Get user's cart
// @route   GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images stock slug');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items with null products (deleted products)
    cart.items = cart.items.filter(item => item.product != null);
    await cart.save();

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate and return
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock slug');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    // Populate and return
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock slug');

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
export const removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();

    // Populate and return
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock slug');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: {
        _id: cart?._id,
        user: req.user._id,
        items: [],
        subtotal: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};