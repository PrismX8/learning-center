self.__uv$config = {
  prefix: "/nebulo-uv/",
  bare: "/bare/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/uv/uv.handler.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  // sw: "/uv/uv.sw.js", // Let UV use default service worker
};
