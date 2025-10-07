export function base64ToHex(base64: string): string {
  const raw = atob(base64);
  let hex = '';
  for (let i = 0; i < raw.length; i++) {
    const hexByte = raw.charCodeAt(i).toString(16);
    hex += hexByte.length === 2 ? hexByte : '0' + hexByte;
  }
  return hex.toUpperCase();
}

export function hexToBase64(hex: string): string {
  const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [];
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

export function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}