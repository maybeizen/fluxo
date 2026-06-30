# Example Gateway Plugin

Reference **gateway** plugin with mock checkout and HMAC-signed webhooks.

## Behaviour

- `autoComplete: true` (default): immediately emits `payment.succeeded`
- `autoComplete: false`: returns a mock redirect URL
- Webhooks: verify `X-Example-Signature` HMAC-SHA256 of raw body

## Test webhook

```bash
BODY='{"invoiceId":1,"paid":true}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "dev-secret" | awk '{print $2}')
curl -X POST http://localhost:3000/api/v1/webhooks/gateway/example-gateway \
  -H "Content-Type: application/json" \
  -H "X-Example-Signature: $SIG" \
  -d "$BODY"
```

See [API.md](../../docs/plugins/API.md) for gateway contracts.
