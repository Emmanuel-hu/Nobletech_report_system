const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();
const repoRoot = process.cwd();

function sha256File(filePath) {
  const bytes = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function encodingAndEol(filePath) {
  const bytes = fs.readFileSync(filePath);
  const hasBom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  const text = bytes.toString('utf8');
  const crlf = (text.match(/\r\n/g) || []).length;
  const lfOnly = (text.match(/(?<!\r)\n/g) || []).length;
  const eol = crlf > 0 && lfOnly === 0 ? 'CRLF' : crlf === 0 && lfOnly > 0 ? 'LF' : crlf > 0 && lfOnly > 0 ? 'MIXED' : 'NONE';
  return { hasBom, eol, crlfCount: crlf, lfOnlyCount: lfOnly };
}

async function main() {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT migration_name, checksum, started_at, finished_at, applied_steps_count, rolled_back_at FROM _prisma_migrations ORDER BY started_at'
  );

  const audits = rows.map((row) => {
    const migrationDir = path.join(repoRoot, 'backend', 'prisma', 'migrations', row.migration_name);
    const filePath = path.join(migrationDir, 'migration.sql');
    const exists = fs.existsSync(filePath);

    if (!exists) {
      return {
        migration_name: row.migration_name,
        db_checksum: row.checksum,
        started_at: row.started_at,
        finished_at: row.finished_at,
        applied_steps_count: row.applied_steps_count,
        rolled_back_at: row.rolled_back_at,
        file_exists: false,
      };
    }

    const fileChecksum = sha256File(filePath);
    const fileMeta = encodingAndEol(filePath);

    return {
      migration_name: row.migration_name,
      db_checksum: row.checksum,
      file_checksum: fileChecksum,
      checksum_match: row.checksum === fileChecksum,
      started_at: row.started_at,
      finished_at: row.finished_at,
      applied_steps_count: row.applied_steps_count,
      rolled_back_at: row.rolled_back_at,
      file_exists: true,
      has_bom: fileMeta.hasBom,
      eol: fileMeta.eol,
      crlf_count: fileMeta.crlfCount,
      lf_only_count: fileMeta.lfOnlyCount,
      file_path: path.relative(repoRoot, filePath).replace(/\\/g, '/'),
    };
  });

  console.log(JSON.stringify(audits, null, 2));
}

main()
  .catch(async (error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
