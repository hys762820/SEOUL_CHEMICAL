// 공용 개발 DB에 이 브랜치의 표 파일과 샘플 데이터를 반영한다.
//
//   npm run db:apply          아직 반영되지 않은 내 표 파일과, 새로 쓰거나 고친 샘플 데이터를 반영
//   npm run db:reset -- --yes (병합 담당자용) 개발 DB를 비우고 지금 폴더의 파일로 다시 만든다
//   npm run db:apply -- --force (병합 담당자용) 다른 사람이 만든 표를 바꾸는 파일도 반영
//
// `supabase db push`를 쓰지 않는 이유: 다른 사람의 표 파일이 내 폴더에 없으면 반영을 거절한다.
// 이 스크립트는 "기록에 없는 내 파일"만 반영하므로, 여러 사람이 각자 브랜치에서 반영할 수 있다.
//
// 접속 주소는 .env.local의 SUPABASE_DB_URL에서 읽는다.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const ROOT = process.cwd();
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");
const SEEDS_DIR = path.join(ROOT, "supabase", "seeds");
const args = new Set(process.argv.slice(2));

function fail(message) {
  console.error(`\n[db:apply] ${message}\n`);
  process.exit(1);
}

// .env.local에서 값 하나를 읽는다. 이미 환경 변수로 들어와 있으면 그것을 쓴다.
function readEnv(name) {
  if (process.env[name]) return process.env[name];
  const file = path.join(ROOT, ".env.local");
  if (!existsSync(file)) return undefined;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match && match[1] === name) return match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
  return undefined;
}

function git(...gitArgs) {
  try {
    return execFileSync("git", gitArgs, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

// 지금 이 컴퓨터에서 커밋하는 사람
function currentPerson() {
  const email = git("config", "user.email").toLowerCase();
  return email ? { email, name: git("config", "user.name") || email } : null;
}

// 표 파일을 처음 커밋한 사람. 아직 커밋하지 않은 파일이면 지금 작업하는 사람.
// 누가 반영했는지가 아니라 누가 썼는지를 보므로, DB를 초기화해도 표의 주인이 바뀌지 않는다.
function fileAuthor(relativePath, me) {
  const log = git("log", "--diff-filter=A", "--format=%ae%x09%an", "--", relativePath);
  const first = log.split("\n").filter(Boolean).pop();
  if (!first) return me;
  const [email, name] = first.split("\t");
  return { email: email.toLowerCase(), name: name || email };
}

function sqlFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => ({ name, sql: readFileSync(path.join(dir, name), "utf8") }));
}

// "public"."Notices" -> notices
function tableName(raw) {
  const cleaned = raw.trim().replace(/"/g, "").toLowerCase();
  return cleaned.startsWith("public.") ? cleaned.slice("public.".length) : cleaned;
}

function tableList(raw) {
  return raw
    .replace(/\b(cascade|restrict|restart\s+identity|continue\s+identity)\b/gi, "")
    .split(",")
    .map(tableName)
    .filter(Boolean);
}

// 표 파일이 만드는 표와, 바꾸거나 지우는 표를 찾는다. 흔한 문장만 읽으므로 완벽하지 않다.
function readTables(sql) {
  const text = sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const created = new Set();
  const changed = new Set();
  const name = String.raw`((?:"[^"]+"|\w+)(?:\.(?:"[^"]+"|\w+))?)`;

  for (const m of text.matchAll(
    new RegExp(String.raw`create\s+(?:unlogged\s+)?table\s+(?:if\s+not\s+exists\s+)?${name}`, "gi"),
  )) {
    created.add(tableName(m[1]));
  }
  for (const m of text.matchAll(
    new RegExp(String.raw`alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?${name}`, "gi"),
  )) {
    changed.add(tableName(m[1]));
  }
  for (const m of text.matchAll(/drop\s+table\s+(?:if\s+exists\s+)?([^;]+)/gi)) {
    tableList(m[1]).forEach((t) => changed.add(t));
  }
  for (const m of text.matchAll(/truncate\s+(?:table\s+)?(?:only\s+)?([^;]+)/gi)) {
    tableList(m[1]).forEach((t) => changed.add(t));
  }
  return { created: [...created], changed: [...changed] };
}

async function ensureRecords(client) {
  await client.query(`
    create schema if not exists db_apply;
    create table if not exists db_apply.migrations (
      version      text primary key,
      name         text not null,
      author_email text,
      author_name  text,
      tables       text[] not null default '{}',
      applied_at   timestamptz not null default now()
    );
    create table if not exists db_apply.seeds (
      name       text primary key,
      hash       text not null,
      applied_at timestamptz not null default now()
    );
  `);
}

// 실패하면 그 파일이 한 일은 모두 되돌린다.
async function inTransaction(client, work) {
  await client.query("begin");
  try {
    await work();
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

async function applyMigrations(client, me) {
  const files = sqlFiles(MIGRATIONS_DIR);
  const { rows } = await client.query(
    "select version, author_email, author_name, tables from db_apply.migrations",
  );
  const applied = new Set(rows.map((row) => row.version));

  // 표 이름 -> 그 표를 만든 사람
  const owner = new Map();
  for (const row of rows) {
    for (const table of row.tables) {
      owner.set(table, { email: row.author_email, name: row.author_name });
    }
  }

  let count = 0;
  for (const file of files) {
    const version = file.name.split("_")[0];
    if (applied.has(version)) continue;

    const author = fileAuthor(`supabase/migrations/${file.name}`, me);
    const { created, changed } = readTables(file.sql);

    // 내가 쓴 파일만 확인한다. 다른 사람이 쓴 파일은 develop을 거쳐 온 것이므로 그대로 반영한다.
    // 초기화는 병합된 파일로 DB를 다시 만드는 일이므로 확인하지 않는다.
    const mine = Boolean(me?.email) && author?.email === me.email;
    const skipCheck = !mine || args.has("--force") || args.has("--reset");
    const others = changed.filter((table) => {
      if (created.includes(table)) return false;
      const madeBy = owner.get(table);
      return madeBy?.email && madeBy.email !== author.email;
    });
    if (others.length > 0 && !skipCheck) {
      const list = others.map((table) => `${table}(만든 사람: ${owner.get(table).name})`).join(", ");
      fail(
        `${file.name}: 다른 사람이 만든 표를 바꾸려고 합니다 → ${list}\n` +
          "이 표는 고치지 말고, 무엇이 필요한지 PR에 적어 병합 담당자에게 알려 주세요.\n" +
          "이 파일은 반영하지 않았습니다.",
      );
    }

    try {
      await inTransaction(client, async () => {
        await client.query(file.sql);
        await client.query(
          `insert into db_apply.migrations (version, name, author_email, author_name, tables)
           values ($1, $2, $3, $4, $5)`,
          [version, file.name, author?.email ?? null, author?.name ?? null, created],
        );
      });
    } catch (error) {
      fail(`${file.name} 반영 실패: ${error.message}\n이 파일이 한 일은 모두 되돌렸습니다.`);
    }
    created.forEach((table) => owner.set(table, author ?? {}));
    console.log(`  표 파일 반영: ${file.name}`);
    count += 1;
  }
  return count;
}

async function applySeeds(client) {
  const files = sqlFiles(SEEDS_DIR);
  const { rows } = await client.query("select name, hash from db_apply.seeds");
  const known = new Map(rows.map((row) => [row.name, row.hash]));

  let count = 0;
  for (const file of files) {
    const hash = createHash("sha256").update(file.sql).digest("hex");
    if (known.get(file.name) === hash) continue;

    try {
      await inTransaction(client, async () => {
        await client.query(file.sql);
        await client.query(
          `insert into db_apply.seeds (name, hash) values ($1, $2)
           on conflict (name) do update set hash = excluded.hash, applied_at = now()`,
          [file.name, hash],
        );
      });
    } catch (error) {
      fail(`샘플 데이터 ${file.name} 반영 실패: ${error.message}\n이 파일이 한 일은 모두 되돌렸습니다.`);
    }
    console.log(`  샘플 데이터 반영: ${file.name}`);
    count += 1;
  }
  return count;
}

// public 스키마에서 우리가 만든 것(표, 뷰, 함수, 타입)을 모두 지운다. 확장 기능이 만든 것은 남긴다.
async function reset(client) {
  await client.query(`
    do $$
    declare item record;
    begin
      for item in
        select c.oid::regclass::text as name, c.relkind
        from pg_class c
        where c.relnamespace = 'public'::regnamespace
          and c.relkind in ('r', 'p', 'v', 'm')
          and not exists (select 1 from pg_depend d where d.objid = c.oid and d.deptype = 'e')
      loop
        execute format(
          'drop %s if exists %s cascade',
          case item.relkind when 'v' then 'view' when 'm' then 'materialized view' else 'table' end,
          item.name
        );
      end loop;

      for item in
        select p.oid::regprocedure::text as name, p.prokind
        from pg_proc p
        where p.pronamespace = 'public'::regnamespace
          and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
      loop
        execute format(
          'drop %s if exists %s cascade',
          case item.prokind when 'p' then 'procedure' when 'a' then 'aggregate' else 'function' end,
          item.name
        );
      end loop;

      for item in
        select t.oid::regtype::text as name
        from pg_type t
        where t.typnamespace = 'public'::regnamespace
          and t.typtype in ('e', 'd', 'c')
          and (t.typrelid = 0 or exists (select 1 from pg_class c where c.oid = t.typrelid and c.relkind = 'c'))
          and not exists (select 1 from pg_depend d where d.objid = t.oid and d.deptype = 'e')
      loop
        execute format('drop type if exists %s cascade', item.name);
      end loop;
    end $$;

    truncate db_apply.migrations, db_apply.seeds;
  `);
}

async function main() {
  const url = readEnv("SUPABASE_DB_URL");
  if (!url) {
    fail(
      ".env.local에 SUPABASE_DB_URL이 없습니다.\n" +
        "병합 담당자에게 받은 .env.local 파일을 프로젝트 맨 위 폴더에 넣어 주세요.",
    );
  }

  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    fail("SUPABASE_DB_URL의 형식이 올바르지 않습니다. postgresql:// 로 시작하는 주소여야 합니다.");
  }
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  const me = currentPerson();
  if (!me) console.log("  (git 사용자 정보를 읽지 못해, 다른 사람의 표인지 확인하지 않습니다.)");

  // Supabase는 암호화 연결을 쓴다. 인증서 파일을 따로 두지 않으므로 인증서 검증은 하지 않는다.
  const client = new pg.Client({
    connectionString: url,
    ssl: local ? false : { rejectUnauthorized: false },
  });
  try {
    await client.connect();
  } catch (error) {
    fail(`DB에 접속하지 못했습니다: ${error.message}`);
  }

  try {
    await ensureRecords(client);

    if (args.has("--reset")) {
      if (!args.has("--yes")) {
        fail(
          "개발 DB의 표와 데이터를 모두 지우고 지금 폴더의 파일로 다시 만듭니다.\n" +
            "다른 사람이 아직 병합하지 않은 표도 지워집니다. 병합 담당자만 실행합니다.\n" +
            "정말 실행하려면: npm run db:reset -- --yes",
        );
      }
      await reset(client);
      console.log("  개발 DB를 비웠습니다.");
    }

    const migrations = await applyMigrations(client, me);
    const seeds = await applySeeds(client);

    // 새 표를 API가 바로 알아보게 한다.
    await client.query("notify pgrst, 'reload schema'");

    if (migrations + seeds === 0) console.log("  반영할 것이 없습니다. 이미 최신입니다.");
    else console.log(`  끝: 표 파일 ${migrations}개, 샘플 데이터 ${seeds}개 반영 (${host})`);
  } finally {
    await client.end();
  }
}

await main();
