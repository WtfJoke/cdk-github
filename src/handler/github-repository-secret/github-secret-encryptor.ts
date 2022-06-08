// eslint-disable-next-line @typescript-eslint/no-require-imports
const _sodium = require('libsodium-wrappers');

// Compatible with the same `Uint8Array` arguments as `tweetsodium.seal()`
async function async_encrypt(messageBytes: Buffer, publicKey: Buffer) {
  await _sodium.ready;
  const libsodium = _sodium;
  return libsodium.crypto_box_seal(messageBytes, publicKey);
}
export const encryptValue = async(valueToEncrypt: string, key: string) => {
  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(valueToEncrypt);
  const keyBytes = Buffer.from(key, 'base64');

  // Encrypt using LibSodium.
  const encryptedBytes = await async_encrypt(messageBytes, keyBytes);

  // Base64 the encrypted secret
  const encrypted = Buffer.from(encryptedBytes).toString('base64');
  return encrypted;
};