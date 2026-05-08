window.getSource = async function() {
  // _b64part1 and _b64part2 are loaded by <script> tags before this
  const b64 = window._b64part1 + window._b64part2;
  const byteChars = atob(b64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i);
  }
  window.getSource = () => {};
  return bytes;
};