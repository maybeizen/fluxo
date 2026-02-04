# Stripe Gateway Plugin

Accept payments via Stripe Checkout. When selected at checkout, the customer is redirected to Stripe to pay.

## Configuration

1. Enable the plugin in Admin → Plugins.
2. Set **Plugin config**: `secretKey` (Stripe secret key, e.g. `sk_test_...`), and optionally `webhookSecret` for payment confirmation.
3. For webhooks: configure Stripe to send `checkout.session.completed` to `POST /api/v1/webhooks/gateway/stripe-gateway`. Use the raw body for signature verification (you may need to configure the route to use raw body for this path).
