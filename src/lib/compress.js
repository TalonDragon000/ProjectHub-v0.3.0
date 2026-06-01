export async function compress(string) {
  const encoder = new TextEncoder();
  const stream = new Blob([encoder.encode(string)])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  const compressed = await new Response(stream).arrayBuffer();
  return new Uint8Array(compressed);
}

export async function decompress(uint8Array) {
  const stream = new Blob([uint8Array])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}
