/*global Ultraviolet*/

const uvConfig = {
  prefix: "/uv/service/",
  bare: "https://bare-server-production-a258.up.railway.app/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/uv/uv.handler.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};

if (typeof self !== "undefined") self.__uv$config = uvConfig;
if (typeof window !== "undefined") window.__uv$config = uvConfig;
