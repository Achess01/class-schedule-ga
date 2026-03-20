#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';

const DEFAULTS = {
  baseUrl: 'http://localhost:3000',
  email: 'ga-admin@example.com',
  password: 'StrongPass123',
  out: 'schedule-view',
};

const args = parseArgs(process.argv.slice(2));
const gaPath = args.ga;
const configId = args['config-id'];
const runGa = args['run-ga'] === 'true';

if ((!gaPath && !runGa) || !configId) {
  printUsageAndExit();
}

const baseUrl = (args['base-url'] ?? DEFAULTS.baseUrl).replace(/\/+$/, '');
const email = args.email ?? DEFAULTS.email;
const password = args.password ?? DEFAULTS.password;
const outPrefix = args.out ?? DEFAULTS.out;

const token = await loginAndGetToken(baseUrl, email, password);
const gaResult = gaPath
  ? JSON.parse(await readFile(gaPath, 'utf8'))
  : await apiPost(baseUrl, `/ga/generate/${configId}`, {}, token);

const [scheduleConfig, allConfigClassrooms, allClassrooms] = await Promise.all([
  apiGet(baseUrl, `/schedule-configs/${configId}`, token),
  apiGet(baseUrl, '/config-classrooms', token),
  apiGet(baseUrl, '/classrooms', token),
]);

const configClassrooms = asArray(allConfigClassrooms).filter(
  (item) =>
    String(item.scheduleConfigId) === String(configId) && item.active !== false,
);

const classroomNameById = new Map(
  asArray(allClassrooms)
    .filter((classroom) => classroom.active !== false)
    .map((classroom) => [String(classroom.classroomId), classroom.name]),
);

const classroomColumns = configClassrooms
  .map((configClassroom) => ({
    configClassroomId: String(configClassroom.configClassroomId),
    classroomId: String(configClassroom.classroomId),
    classroomName:
      classroomNameById.get(String(configClassroom.classroomId)) ??
      `Classroom ${configClassroom.classroomId}`,
  }))
  .sort((left, right) => left.classroomName.localeCompare(right.classroomName));

const slots = buildSlots(scheduleConfig);
const table = buildCombinedTable(gaResult, slots, classroomColumns);

const markdown = renderMarkdown(
  table,
  gaResult,
  scheduleConfig,
  classroomColumns,
  outPrefix,
);
const html = renderHtml(table, gaResult, scheduleConfig, outPrefix);

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
      '  node scripts/render-ga-schedule.mjs --ga <ga-result.json> --config-id <id> [--base-url <url>] [--email <email>] [--password <password>] [--out <prefix>]',
      '  node scripts/render-ga-schedule.mjs --run-ga --config-id <id> [--base-url <url>] [--email <email>] [--password <password>] [--out <prefix>]',
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

  const token = payload.access_token ?? payload.token;
  if (!token) {
    throw new Error('Login response does not include accessToken');
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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildSlots(scheduleConfig) {
  const duration = Number(scheduleConfig.periodDurationM);

  const morningStart = toMinuteOfDay(scheduleConfig.morningStartTime);
  const morningEnd = toMinuteOfDay(scheduleConfig.morningEndTime);
  const afternoonStart = toMinuteOfDay(scheduleConfig.afternoonStartTime);
  const afternoonEnd = toMinuteOfDay(scheduleConfig.afternoonEndTime);

  const morningCount = Math.floor((morningEnd - morningStart) / duration);
  const afternoonCount = Math.floor((afternoonEnd - afternoonStart) / duration);

  const slots = [];
  for (let i = 0; i < morningCount; i += 1) {
    slots.push({
      slotIndex: slots.length,
      startMinute: morningStart + i * duration,
      endMinute: morningStart + (i + 1) * duration,
    });
  }

  for (let i = 0; i < afternoonCount; i += 1) {
    slots.push({
      slotIndex: slots.length,
      startMinute: afternoonStart + i * duration,
      endMinute: afternoonStart + (i + 1) * duration,
    });
  }

  return slots;
}

function buildCombinedTable(gaResult, slots, classroomColumns) {
  const dayBuckets = [
    { dayIndex: 0, labelPrefix: '' },
    { dayIndex: 1, labelPrefix: 'M LAB' },
    { dayIndex: 2, labelPrefix: 'J LAB' },
  ];

  const columns = [];
  for (const room of classroomColumns) {
    for (const day of dayBuckets) {
      columns.push({
        key: `${day.dayIndex}:${room.configClassroomId}`,
        label: `${day.labelPrefix}\n${room.classroomName}`,
      });
    }
  }

  const rows = slots.map((slot) => {
    const row = {
      Slot: `${toHourMinute(slot.startMinute)}-${toHourMinute(slot.endMinute)}`,
    };
    for (const column of columns) {
      row[column.label] = '';
    }
    return row;
  });

  const genes = asArray(gaResult.genes);
  for (const gene of genes) {
    if (
      gene.configClassroomId === undefined ||
      gene.configClassroomId === null
    ) {
      continue;
    }

    const start = Number(gene.startSlot);
    const periods = Number(gene.periodCount);
    const dayIndex = Number(gene.dayIndex);
    const key = `${dayIndex}:${String(gene.configClassroomId)}`;
    const column = columns.find((item) => item.key === key);
    if (!column) {
      continue;
    }

    const professor = gene.configProfessorId ?? 'UNASSIGNED';
    const cellText = `${gene.courseCode} ${gene.sectionIndex === 1 ? "A" : "B"} P:${professor}`;

    for (let offset = 0; offset < periods; offset += 1) {
      const row = rows[start + offset];
      if (!row) {
        continue;
      }
      if (!row[column.label]) {
        row[column.label] = cellText;
      } else {
        row[column.label] = `${row[column.label]}<br>${cellText}`;
      }
    }
  }

  return {
    columns: ['Slot', ...columns.map((column) => column.label)],
    rows,
  };
}

function renderMarkdown(
  table,
  gaResult,
  scheduleConfig,
  classroomColumns,
  outPrefix,
) {
  const header = table.columns.map((value) => escapeMd(value)).join(' | ');
  const divider = table.columns.map(() => '---').join(' | ');
  const lines = [`| ${header} |`, `| ${divider} |`];

  for (const row of table.rows) {
    const values = table.columns.map((column) => escapeMd(row[column] ?? ''));
    lines.push(`| ${values.join(' | ')} |`);
  }

  const unassigned = asArray(gaResult.genes)
    .filter(
      (gene) =>
        gene.configClassroomId === undefined || gene.configClassroomId === null,
    )
    .map(
      (gene) =>
        `- ${gene.courseCode} S${gene.sectionIndex} ${gene.sessionType} P:${gene.configProfessorId ?? 'UNASSIGNED'}`,
    );

  return [
    `# ${outPrefix}`,
    '',
    `- scheduleConfigId: ${scheduleConfig.scheduleConfigId}`,
    `- periodDurationM: ${scheduleConfig.periodDurationM}`,
    `- classrooms in config: ${classroomColumns.length}`,
    '',
    ...lines,
    '',
    '## Unassigned Genes',
    ...(unassigned.length > 0 ? unassigned : ['- None']),
    '',
  ].join('\n');
}

function renderHtml(table, gaResult, scheduleConfig, outPrefix) {
  const th = table.columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join('');
  const tr = table.rows
    .map((row) => {
      const tds = table.columns
        .map(
          (column) =>
            `<td>${escapeHtml((row[column] ?? '').replaceAll('<br>', '\n')).replaceAll('\n', '<br>')}</td>`,
        )
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('\n');

  const unassigned = asArray(gaResult.genes)
    .filter(
      (gene) =>
        gene.configClassroomId === undefined || gene.configClassroomId === null,
    )
    .map(
      (gene) =>
        `<li>${escapeHtml(`${gene.courseCode} S${gene.sectionIndex} ${gene.sessionType} P:${gene.configProfessorId ?? 'UNASSIGNED'}`)}</li>`,
    )
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
  <p>scheduleConfigId: ${escapeHtml(String(scheduleConfig.scheduleConfigId))} | periodDurationM: ${escapeHtml(String(scheduleConfig.periodDurationM))}</p>
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

function toMinuteOfDay(dateLike) {
  const date = new Date(dateLike);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function toHourMinute(minutes) {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
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
