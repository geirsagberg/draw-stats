import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function keyFromSecret(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export type EncryptedValue = {
  encrypted: string;
  nonce: string;
  tag: string;
};

export function encryptToken(token: string, secret: string): EncryptedValue {
  const nonce = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, keyFromSecret(secret), nonce);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString("base64"),
    nonce: nonce.toString("base64"),
    tag: tag.toString("base64")
  };
}

export function decryptToken(value: EncryptedValue, secret: string) {
  const decipher = createDecipheriv(
    ALGORITHM,
    keyFromSecret(secret),
    Buffer.from(value.nonce, "base64")
  );
  decipher.setAuthTag(Buffer.from(value.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(value.encrypted, "base64")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}
