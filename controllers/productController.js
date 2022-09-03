const BigPromise = require("../middleware/bigPromise");
const Product = require("../models/product");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  // images
  let imageArray = [];

  if (!req.files) {
    return next(new Error("Images are required"));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({ id: result.public_id, secure_url: result.secure_url });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({ success: true, product });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;

  const productsObject = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObject.base;
  const filteredProductCount = products.length;

  productsObject.pager(resultPerPage);
  products = await productsObject.base.clone();

  res.status(200).json({ success: true, products, filteredProductCount });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
  const product = Product.findById(req.params.id);

  if (!product) {
    return next(new Error("No product found"));
  }

  res.status(200).json({ success: true, product });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id
  );

  if (alreadyReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  // adjust rating
  product.ratings =
    product.reviews.reduce(
      (accumulator, item) => item.rating + accumulator,
      0
    ) / product.reviews.length;

  // save changes
  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (review) => review.user.toString() !== req.user._id
  );

  const numOfReviews = reviews.length;

  // adjust rating
  product.ratings =
    product.reviews.reduce(
      (accumulator, item) => item.rating + accumulator,
      0
    ) / product.reviews.length;

  // update product
  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.status(200).json({ success: true });
});

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({ success: true, reviews: product.reviews });
});

exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({ success: true, products });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Error("no product found"));
  }

  let imageArray = [];

  if (req.files) {
    // destroy the existing images
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(
        product.product.photos[index].id
      );
    }

    // upload and save the images
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({ id: result.public_id, secure_url: result.secure_url });
    }
  }

  req.body.photo = imageArray;
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, product });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Error("no product found"));
  }

  // destroy the existing images
  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.v2.uploader.destroy(product.product.photos[index].id);
  }

  await product.remove();

  res.status(200).json({ success: true, message: "product was deleted!" });
});
