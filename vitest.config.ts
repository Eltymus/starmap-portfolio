import { defineConfig } from 'vitest/config';

// The project sits in OneDrive, where every file is a reparse point. Vite 8's native resolver treats those as
// symlinks and fails to canonicalise them ("Cannot resolve entry module", "Cannot find module"). npm never creates
// symlinks here, so keeping paths as they are changes nothing elsewhere (CI, Linux).
export default defineConfig({
  resolve: { preserveSymlinks: true },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node'
  }
});
