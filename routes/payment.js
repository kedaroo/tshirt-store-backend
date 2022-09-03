const router = require("express").Router();
const {
  sendStripeKey,
  sendRazorpayKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require("../controllers/paymentController");
const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/stripeKey").get(isLoggedIn, sendStripeKey);
router.route("/razorpayKey").get(isLoggedIn, sendRazorpayKey);

router.route("/captureStripe").post(isLoggedIn, captureStripePayment);
router.route("/captureRazorpay").post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
