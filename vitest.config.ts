import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // 🚀 Thêm phần này để xử lý các thư viện "khó chiều" như next-auth
    server: {
      deps: {
        inline: ["next-auth"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // 🚀 Trỏ thẳng vào file .js như gợi ý của lỗi (Did you mean...)
      "next/server": path.resolve(__dirname, "./node_modules/next/server.js"),
    },
  },
});