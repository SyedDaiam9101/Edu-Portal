import { spawn } from 'node:child_process';

const command = process.argv[2];
if (!command || !['dev', 'start'].includes(command)) {
  // eslint-disable-next-line no-console
  console.error('Usage: node scripts/next-runner.mjs <dev|start>');
  process.exit(1);
}

const port = process.env.WEB_PORT ?? process.env.PORT ?? '3000';

const args = command === 'dev' ? ['dev', '-p', port] : ['start', '-p', port];
const child = spawn('next', args, { stdio: 'inherit', shell: true });

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

