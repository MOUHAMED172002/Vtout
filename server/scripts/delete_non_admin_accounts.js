import 'dotenv/config';
import mysql from 'mysql2/promise';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

if (ADMIN_EMAILS.length === 0) {
  console.error('❌ Aucun ADMIN_EMAILS défini dans .env. Abandon pour sécurité.');
  process.exit(1);
}

const DB_URL = process.env.MYSQL_DATABASE_URL;
// Parse mysql://user:pass@host:port/db
const match = DB_URL.match(/mysql:\/\/([^:]*):([^@]*)@([^:]+):(\d+)\/(.+)/);
if (!match) {
  console.error('❌ MYSQL_DATABASE_URL invalide :', DB_URL);
  process.exit(1);
}
const [, user, password, host, port, database] = match;

const conn = await mysql.createConnection({ host, port: Number(port), user, password: password || undefined, database });

console.log('✅ Connecté à la base :', database);
console.log('🛡️  Comptes admin à conserver :', ADMIN_EMAILS);

// ---------------------------------------------------------------------------
// 1. Identifier les IDs admin dans la table `user` (Better Auth)
// ---------------------------------------------------------------------------
const [adminUsers] = await conn.execute(
  `SELECT id, email FROM \`user\` WHERE LOWER(email) IN (${ADMIN_EMAILS.map(() => '?').join(',')})`,
  ADMIN_EMAILS
);
console.log(`\n📋 Admins trouvés dans \`user\` :`, adminUsers.map(u => `${u.email} (${u.id})`));

const adminIds = adminUsers.map(u => u.id);

if (adminIds.length === 0) {
  console.warn('⚠️  Aucun admin trouvé dans la table `user`. Vérifiez vos ADMIN_EMAILS.');
  console.warn('   Abandon pour éviter de tout supprimer.');
  await conn.end();
  process.exit(1);
}

const placeholders = adminIds.map(() => '?').join(',');

// ---------------------------------------------------------------------------
// 2. Comptes à supprimer (aperçu avant suppression)
// ---------------------------------------------------------------------------
const [usersToDelete] = await conn.execute(
  `SELECT id, email FROM \`user\` WHERE id NOT IN (${placeholders})`,
  adminIds
);
console.log(`\n🗑️  ${usersToDelete.length} compte(s) à supprimer :`);
usersToDelete.forEach(u => console.log(`   - ${u.email} (${u.id})`));

if (usersToDelete.length === 0) {
  console.log('\n✅ Rien à supprimer – seuls les comptes admin existent déjà.');
  await conn.end();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 3. Suppression dans l'ordre (FK : account → profile → user)
// ---------------------------------------------------------------------------

// 3a. Table `account` (Better Auth – liée à user.id via userId)
try {
  const [r1] = await conn.execute(
    `DELETE FROM \`account\` WHERE userId NOT IN (${placeholders})`,
    adminIds
  );
  console.log(`\n✅ account  : ${r1.affectedRows} ligne(s) supprimée(s)`);
} catch (e) {
  console.warn('⚠️  account :', e.message);
}

// 3b. Table `session` (Better Auth – si elle existe)
try {
  const [r2] = await conn.execute(
    `DELETE FROM \`session\` WHERE userId NOT IN (${placeholders})`,
    adminIds
  );
  console.log(`✅ session  : ${r2.affectedRows} ligne(s) supprimée(s)`);
} catch (e) {
  console.warn('⚠️  session :', e.message);
}

// 3c. Table `verification` (Better Auth – si elle existe)
try {
  const [r3] = await conn.execute(
    `DELETE FROM \`verification\` WHERE identifier NOT IN (${ADMIN_EMAILS.map(() => '?').join(',')})`,
    ADMIN_EMAILS
  );
  console.log(`✅ verification : ${r3.affectedRows} ligne(s) supprimée(s)`);
} catch (e) {
  console.warn('⚠️  verification :', e.message);
}

// 3d. Table `profile` (liée à user.id via id ou userId)
try {
  // Essai avec colonne `id` comme FK vers user
  const [r4] = await conn.execute(
    `DELETE FROM \`profile\` WHERE id NOT IN (${placeholders})`,
    adminIds
  );
  console.log(`✅ profile  : ${r4.affectedRows} ligne(s) supprimée(s)`);
} catch (e) {
  try {
    // Fallback : colonne userId
    const [r4b] = await conn.execute(
      `DELETE FROM \`profile\` WHERE userId NOT IN (${placeholders})`,
      adminIds
    );
    console.log(`✅ profile  : ${r4b.affectedRows} ligne(s) supprimée(s)`);
  } catch (e2) {
    console.warn('⚠️  profile :', e2.message);
  }
}

// 3e. Table `user`
const [r5] = await conn.execute(
  `DELETE FROM \`user\` WHERE id NOT IN (${placeholders})`,
  adminIds
);
console.log(`✅ user     : ${r5.affectedRows} ligne(s) supprimée(s)`);

// ---------------------------------------------------------------------------
// 4. Vérification finale
// ---------------------------------------------------------------------------
const [remaining] = await conn.execute(`SELECT id, email, role FROM \`user\``);
console.log(`\n📊 Comptes restants dans \`user\` (${remaining.length}) :`);
remaining.forEach(u => console.log(`   ✔ ${u.email} [${u.role}]`));

await conn.end();
console.log('\n🎉 Nettoyage terminé.');
