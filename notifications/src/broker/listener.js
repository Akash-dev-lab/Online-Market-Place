const {subscribeToQueue} = require("./broker")
const {sendEmail} = require("../email")

module.exports = function () {

    subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED", async (data) => {
    
        const emailHTMLTemplate = `
        <h1>Welcome to Our Service !</h1>
        <p>Dear ${data.fullName},</p>
        <p>Thank you for registering with us. We're excited to have you on board!</p>
        <p>Best regards, <br/>The Team</p>`

        await sendEmail(data.email, "Welcome to our Service", "Thank you for registering with us!", emailHTMLTemplate)
})

 subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", async (data) => {
        try {
    console.log("📩 PAYMENT_NOTIFICATION.PAYMENT_INITIATED received:", data);

    // ✅ Safely extract fields
    const { email, fullName, amount, currency, orderId } = data;

    // ✅ Fallback name if missing
    const name = fullName || "Customer";

    // ✅ Proper email HTML
    const emailHTMLTemplate = `
      <h1>💳 Payment Initiated</h1>
      <p>Dear ${name},</p>
      <p>Your payment of <strong>${currency} ${amount}</strong> for Order ID <strong>${orderId}</strong> has been successfully initiated.</p>
      <p>We will notify you once your payment is confirmed.</p>
      <br/>
      <p>Best regards,<br/>The Nova Marketplace Team</p>
    `;

    // ✅ Send email
    await sendEmail(
      email,
      "Payment Initiated",
      "Your payment is being processed",
      emailHTMLTemplate
    );

    console.log("✅ Payment initiation mail sent successfully to:", email);
  } catch (err) {
    console.error("❌ Failed to send payment initiation email:", err);
  }
    }
)

subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", async (data) => {
        const emailHTMLTemplate = `
        <h1>Payment Successful!</h1>
        <p>Dear ${data.fullName},</p>
        <p>We have received your payment of ${data.currency} ${data.amount} for the order ID: ${data.orderId}.</p>
        <p>Thank you for your purchase!</p>
        <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, "Payment Successful", "We have received your payment", emailHTMLTemplate);
    })

     subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", async (data) => {
        const emailHTMLTemplate = `
        <h1>Payment Failed</h1>
        <p>Dear ${data.fullName},</p>
        <p>Unfortunately, your payment for the order ID: ${data.orderId} has failed.</p>
        <p>Please try again or contact support if the issue persists.</p>
        <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, "Payment Failed", "Your payment could not be processed", emailHTMLTemplate);
    })

     subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
        console.log(data)
        const emailHTMLTemplate = `
        <h1>New Product Available!</h1>
        <p>Dear ${data.fullName},</p>
        <p>Check it out and enjoy exclusive launch offers!</p>
        <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, "New Product Launched", "Check out our latest product", emailHTMLTemplate);
    })
}