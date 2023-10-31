export function base64ToUint8Array(base64: string) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function uint8ArrayToFloat32Array(u8a: Uint8Array) {
  const numSamples = u8a.length / 2; // because 16-bit samples
  const f32Array = new Float32Array(numSamples);
  let ptr = 0;

  for (let i = 0; i < numSamples; i++) {
    // Convert 2 bytes to a 16-bit signed integer
    const sample = (u8a[ptr + 1] << 8) | u8a[ptr];
    ptr += 2;

    // Normalize to [-1, 1]
    f32Array[i] = sample < 0x8000 ? sample / 0x8000 : (sample - 0x10000) / 0x8000;
  }

  return f32Array;
}
