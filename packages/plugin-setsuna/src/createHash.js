import crypto from "crypto"

export function createHash(content = "") {
  return crypto
    .createHmac("sha1", "setsuna")
    .update(content)
    .digest("hex")
    .slice(0, 8)
}
