const Order = require("../models/order");
const Product = require("../models/product");
const BigPromise = require("../middleware/bigPromise");
const order = require("../models/order");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({ success: true, order });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new Error("PLease check order ID"));
  }

  res.status(200).json({ success: true, order });
});

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders) {
    return next(new Error("PLease check order ID"));
  }

  res.status(200).json({ success: true, orders });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({ success: true, orders });
});

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "delivered") {
    return next(new Error("Order is marked as delivered"));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(
    async (product) =>
      await updateProductStock(product.product, product.quantity)
  );

  await order.save();

  res.status(200).json({ success: true, orders });
});

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove();

  res.status(200).json({ success: true });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}
