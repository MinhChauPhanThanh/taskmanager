import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  // 🚀 Nạp cấu hình Next.js và TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Bỏ qua các file/thư mục không cần kiểm tra
    ignores: [
      ".next/*",
      "out/*",
      "build/*",
      "next-env.d.ts",
      "node_modules/*"
    ],
  },
  {
    rules: {
      // Chuyển lỗi "biến không sử dụng" thành cảnh báo màu vàng cho đỡ khó chịu
      "@typescript-eslint/no-unused-vars": "warn",
      // Tắt lỗi bắt buộc kiểu dữ liệu "any" để Châu code nhanh hơn
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];