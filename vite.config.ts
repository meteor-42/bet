import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// Конфигурация Vite
// Примечания:
// - host: "::" позволяет доступ по IPv4/IPv6 и из iframe среды Same (0.0.0.0 эквивалент)
// - port: 8080 — выбран под среду предпросмотра Same
// - Плагин react-swc ускоряет сборку/обновление
// - componentTagger включаем только в dev для отладки
// - alias '@' указывает на каталог src, чтобы импортировать короче
// - build.outDir: 'out' — каталог сборки
export default defineConfig(({ mode }) => ({
  server: {
    // Хост, доступный извне контейнера (нужно для предпросмотра в Same)
    host: "::",
    // Порт dev-сервера
    port: 8080,
  },
  plugins: [
    // Плагин React на базе SWC для быстрой разработки
    react(),
    // Теггер компонентов полезен в разработке, отключаем в проде
    mode === 'development' && componentTagger(),
    // Генерация отчета по бандлу после сборки
    visualizer({
      filename: 'out/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      // Короткий импорт: '@/...' будет ссылаться на 'src/...'
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Директория для прод-сборки
    outDir: 'out',
    // Очищаем каталог перед сборкой
    emptyOutDir: true,
    // Разрешим варнинги до 1500 кб (после оптимизаций обычно не потребуется)
    chunkSizeWarningLimit: 1500,
    // rollupOptions manualChunks temporarily disabled for diagnostics
    // rollupOptions: {
    //   output: {
    //     manualChunks(id) {
    //       if (id.includes('node_modules')) {
    //         if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
    //           return 'vendor-react';
    //         }
    //         if (id.includes('@radix-ui')) {
    //           return 'vendor-radix';
    //         }
    //         if (id.includes('recharts')) {
    //           return 'vendor-recharts';
    //         }
    //         if (id.includes('date-fns')) {
    //           return 'vendor-datefns';
    //         }
    //         if (id.includes('lucide-react')) {
    //           return 'vendor-icons';
    //         }
    //         return 'vendor';
    //       }
    //     },
    //   },
    // },
  },
}));
