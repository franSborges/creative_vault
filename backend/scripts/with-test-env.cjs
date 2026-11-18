// Executa um comando com as variáveis de .env.test (sobrescrevendo .env).
// Substitui dotenv-cli, cujo binário "dotenv" conflita com o CLI embutido no dotenv 18.
// Uso: node scripts/with-test-env.cjs <comando> [args...]  (funciona no PowerShell)
const { spawnSync } = require("node:child_process");
require("dotenv").config({ path: ".env.test", override: true, quiet: true });
process.env.NODE_ENV = "test";
const r = spawnSync(process.argv.slice(2).join(" "), { stdio: "inherit", shell: true, env: process.env });
process.exit(r.status ?? 1);
