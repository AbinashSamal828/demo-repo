require("dotenv").config();
const crypto = require("crypto");
const sigHeaderName = "X-Hub-Signature-256";
const sigHashAlg = "sha256";

function validateWebhookPayload(req, res, next) {
  if (req.method == "POST") {
    if (!req.rawBody) {
      return next("Request body empty");
    }
    const secret = process.env.PAYLOAD_VALIDATION_SECRET;
    
    const sig = Buffer.from(req.get(sigHeaderName) || "", "utf8");
    const hmac = crypto.createHmac(sigHashAlg, secret);
    const digest = Buffer.from(
      sigHashAlg + "=" + hmac.update(req.rawBody).digest("hex"),
      "utf8"
    );

    if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
      return next(
        `Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`
      );
    }
  }

  return next();
}

module.exports = validateWebhookPayload;
