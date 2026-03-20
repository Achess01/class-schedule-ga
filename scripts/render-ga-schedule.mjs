#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';

const DEFAULTS = {
  baseUrl: 'http://localhost:3000',
  email: 'ga-admin@example.com',
  password: 'StrongPass123',
  out: 'schedule-view',
};

const args = parseArgs(process.argv.slice(2));
const configId = args['config-id'];
const generatedScheduleId = args['generated-schedule-id'];
const runGa = args['run-ga'] === 'true';

if ((!runGa && !generatedScheduleId) || (runGa && !configId)) {
  printUsageAndExit();
}

const baseUrl = (args['base-url'] ?? DEFAULTS.baseUrl).replace(/\/+$/, '');
const email = args.email ?? DEFAULTS.email;
const password = args.password ?? DEFAULTS.password;
const outPrefix = args.out ?? DEFAULTS.out;

const token = await loginAndGetToken(baseUrl, email, password);
const payload = runGa
  ? await runAndFetchGeneratedSchedule(baseUrl, configId, token)
  : await apiGet(baseUrl, `/generated-schedules/${generatedScheduleId}`, token);

const table = buildTableFromSlotsAndItems(payload);
const markdown = renderMarkdown(payload, table, outPrefix);
const html = renderHtml(payload, table, outPrefix);

await writeFile(`${outPrefix}.md`, markdown, 'utf8');
await writeFile(`${outPrefix}.html`, html, 'utf8');

console.log(`Created ${outPrefix}.md and ${outPrefix}.html`);

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith('--')) {
      continue;
    }
    const key = raw.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      parsed[key] = 'true';
      continue;
    }
    parsed[key] = value;
    i += 1;
  }
  return parsed;
}

function printUsageAndExit() {
  console.error(
    [
      'Usage:',
      '  node scripts/render-ga-schedule.mjs --run-ga --config-id <id> [--base-url <url>] [--email <email>] [--password <password>] [--out <prefix>]',
      '  node scripts/render-ga-schedule.mjs --generated-schedule-id <id> [--base-url <url>] [--email <email>] [--password <password>] [--out <prefix>]',
      '',
      'Defaults:',
      `  --base-url ${DEFAULTS.baseUrl}`,
      `  --email ${DEFAULTS.email}`,
      `  --password ${DEFAULTS.password}`,
      `  --out ${DEFAULTS.out}`,
    ].join('\n'),
  );
  process.exit(1);
}

async function loginAndGetToken(baseUrl, email, password) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `Login failed (${response.status}): ${JSON.stringify(payload)}`,
    );
  }

  const token = payload.access_token;
  if (!token) {
    throw new Error('Login response does not include access_token');
  }

  return token;
}

async function apiGet(baseUrl, path, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `GET ${path} failed (${response.status}): ${JSON.stringify(payload)}`,
    );
  }

  return payload;
}

async function apiPost(baseUrl, path, body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `POST ${path} failed (${response.status}): ${JSON.stringify(payload)}`,
    );
  }

  return payload;
}

async function runAndFetchGeneratedSchedule(baseUrl, configId, token) {
  const generationPayload = await apiPost(
    baseUrl,
    `/ga/generate/${configId}`,
    {},
    token,
  );

  const id = generationPayload.generatedScheduleId;
  if (!id) {
    throw new Error(
      'GA generation response does not include generatedScheduleId',
    );
  }

  return apiGet(baseUrl, `/generated-schedules/${id}`, token);
}

function buildTableFromSlotsAndItems(payload) {
  const slots = Array.isArray(payload.slots) ? payload.slots : [];
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (slots.length === 0) {
    throw new Error('Payload does not include slots.');
  }

  const classrooms = new Map();
  for (const item of items) {
    if (
      item.configClassroomId === undefined ||
      item.configClassroomId === null
    ) {
      continue;
    }

    const id = String(item.configClassroomId);
    if (!classrooms.has(id)) {
      classrooms.set(id, item.classroomName ?? `Classroom ${id}`);
    }
  }

  const sortedClassrooms = [...classrooms.entries()]
    .map(([configClassroomId, classroomName]) => ({
      configClassroomId,
      classroomName,
    }))
    .sort((left, right) =>
      left.classroomName.localeCompare(right.classroomName),
    );

  const dayBuckets = [
    { dayIndex: 0, prefix: 'CLASS' },
    { dayIndex: 1, prefix: 'LAB1 LAB' },
    { dayIndex: 2, prefix: 'LAB2 LAB' },
  ];

  const columns = sortedClassrooms.flatMap((room) =>
    dayBuckets.map((day) => ({
      key: `${day.dayIndex}:${room.configClassroomId}`,
      label: `${day.prefix} - ${room.classroomName}`,
    })),
  );

  const rows = slots.map((slot) => {
    const row = {
      slot: slot.label ?? `${slot.startTime}-${slot.endTime}`,
      cells: {},
    };
    for (const column of columns) {
      row.cells[column.key] = '';
    }
    return row;
  });

  for (const item of items) {
    if (
      item.configClassroomId === undefined ||
      item.configClassroomId === null
    ) {
      continue;
    }

    const key = `${Number(item.dayIndex)}:${String(item.configClassroomId)}`;
    const exists = columns.some((column) => column.key === key);
    if (!exists) {
      continue;
    }

    const sectionLabel = Number(item.sectionIndex) === 1 ? 'A' : 'B';
    const professor =
      item.professorName ?? item.configProfessorId ?? 'UNASSIGNED';
    const cellValue =
      `${item.courseCode} ${item.courseName ?? ''} ${sectionLabel} P:${professor}`.trim();

    for (let offset = 0; offset < Number(item.periodCount); offset += 1) {
      const row = rows[Number(item.startSlot) + offset];
      if (!row) {
        continue;
      }
      if (!row.cells[key]) {
        row.cells[key] = cellValue;
      } else {
        row.cells[key] = `${row.cells[key]} | ${cellValue}`;
      }
    }
  }

  return { columns, rows };
}

function renderMarkdown(payload, table, outPrefix) {
  const headers = ['Slot', ...table.columns.map((column) => column.label)];
  const divider = headers.map(() => '---').join(' | ');
  const lines = [`| ${headers.map(escapeMd).join(' | ')} |`, `| ${divider} |`];

  for (const row of table.rows) {
    const values = [row.slot];
    for (const column of table.columns) {
      values.push(row.cells[column.key] ?? '');
    }
    lines.push(`| ${values.map(escapeMd).join(' | ')} |`);
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const unassigned = items
    .filter(
      (item) =>
        item.configClassroomId === undefined || item.configClassroomId === null,
    )
    .map((item) => {
      const professor =
        item.professorName ?? item.configProfessorId ?? 'UNASSIGNED';
      return `- ${item.courseCode} ${item.courseName ?? ''} S${item.sectionIndex} ${item.sessionType} P:${professor}`;
    });

  return [
    `# ${outPrefix}`,
    '',
    `- generatedScheduleId: ${payload.generatedScheduleId ?? 'N/A'}`,
    `- scheduleConfigId: ${payload.scheduleConfigId}`,
    '',
    ...lines,
    '',
    '## Unassigned Genes',
    ...(unassigned.length > 0 ? unassigned : ['- None']),
    '',
  ].join('\n');
}

function renderHtml(payload, table, outPrefix) {
  const headers = ['Slot', ...table.columns.map((column) => column.label)];
  const th = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');

  const tr = table.rows
    .map((row) => {
      const values = [row.slot];
      for (const column of table.columns) {
        values.push(row.cells[column.key] ?? '');
      }

      const tds = values
        .map(
          (value) =>
            `<td>${escapeHtml(String(value)).replaceAll('|', '<br>')}</td>`,
        )
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('\n');

  const items = Array.isArray(payload.items) ? payload.items : [];
  const unassigned = items
    .filter(
      (item) =>
        item.configClassroomId === undefined || item.configClassroomId === null,
    )
    .map((item) => {
      const professor =
        item.professorName ?? item.configProfessorId ?? 'UNASSIGNED';
      return `<li>${escapeHtml(`${item.courseCode} ${item.courseName ?? ''} S${item.sectionIndex} ${item.sessionType} P:${professor}`)}</li>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(outPrefix)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 16px; }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    th, td { border: 1px solid #ccc; padding: 6px; vertical-align: top; font-size: 12px; word-wrap: break-word; }
    th { background: #f3f3f3; position: sticky; top: 0; }
    .wrap { overflow: auto; max-height: 80vh; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>${escapeHtml(outPrefix)}</h1>
  <p>generatedScheduleId: ${escapeHtml(String(payload.generatedScheduleId ?? 'N/A'))} | scheduleConfigId: ${escapeHtml(String(payload.scheduleConfigId))}</p>
  <div class="wrap">
    <table>
      <thead><tr>${th}</tr></thead>
      <tbody>
        ${tr}
      </tbody>
    </table>
  </div>
  <h2>Unassigned Genes</h2>
  <ul>${unassigned || '<li>None</li>'}</ul>
</body>
</html>`;
}

function escapeMd(value) {
  return String(value).replaceAll('|', '\\|');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
