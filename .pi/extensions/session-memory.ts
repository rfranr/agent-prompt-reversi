
import type { ExtensionAPI } from '@mariozechner/pi-coding-agent';
import { spawn } from 'node:child_process';
import {
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const MEMORY_ROOT = '/home/rfranr/source/github.com/rfranr/memory-cli';
const MEMORY_DB = join(MEMORY_ROOT, 'rag-sessions-clean.sqlite');
const OUTPUT_DIR = join(homedir(), '.local/share/pi-memory/sessions');
const LOG_FILE = '/tmp/pi-memory-index.log';

type PiMessage = {
  role?: string;
  content?: string | Array<{ type?: string; text?: string }>;
};

type PiRecord = {
  type?: string;
  id?: string;
  timestamp?: string;
  message?: PiMessage;
};

function extractConversation(sessionFile: string): string {
  const raw = readFileSync(sessionFile, 'utf8');
  const output: string[] = [`SOURCE: ${sessionFile}`];

  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;

    const record = JSON.parse(line) as PiRecord;
    if (record.type !== 'message') continue;

    const role = record.message?.role;
    if (role !== 'user' && role !== 'assistant') continue;

    const content = record.message?.content;
    const text = typeof content === 'string'
      ? content
      : (content ?? [])
          .filter((part) => part.type === 'text')
          .map((part) => part.text ?? '')
          .join('\n');

    if (!text.trim()) continue;

    output.push(
      '',
      `[${record.timestamp ?? 'unknown'}] ${role.toUpperCase()} (id: ${record.id ?? 'unknown'})`,
      text,
    );
  }

  return output.join('\n');
}

export default function (pi: ExtensionAPI) {
  pi.on('session_start', (event, ctx) => {
    if (event.reason !== 'new' || !event.previousSessionFile) return;

    const sessionFile = event.previousSessionFile;

    try {
      const cleanText = extractConversation(sessionFile);

      mkdirSync(OUTPUT_DIR, { recursive: true });

      const outputFile = join(
        OUTPUT_DIR,
        `${basename(sessionFile, '.jsonl')}.txt`,
      );

      writeFileSync(outputFile, cleanText, 'utf8');

      const log = openSync(LOG_FILE, 'a');

      try {
        const child = spawn(
          'pnpm',
          [
            'start',
            'index',
            outputFile,
            '--metadata',
            JSON.stringify({
              type: 'session',
              project: basename(ctx.cwd),
              originalSession: sessionFile,
            }),
          ],
          {
            cwd: MEMORY_ROOT,
            env: {
              ...process.env,
              RAG_CLI_DB: MEMORY_DB,
            },
            stdio: ['ignore', log, log],
            detached: true,
          },
        );

        child.on('error', (error) => {
          console.error('Memory indexing failed:', error);
        });

        child.unref();
        ctx.ui.notify('Session memory indexing launched', 'info');
      } finally {
        closeSync(log);
      }
    } catch (error) {
      console.error('Session memory preparation failed:', error);
      ctx.ui.notify('Session memory preparation failed', 'error');
    }
  });
}
