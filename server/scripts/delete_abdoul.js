import 'dotenv/config';
import mysql from 'mysql2/promise';

const DB_URL = process.env.MYSQL_DATABASE_URL;
const match = DB_URL.match(/mysql:\/\/([^:]*):([^@]*)@([^:]+):(\d+)\/(.+)/);
const [, user, password, host, port, database] = match;

const conn = await mysql.createConnection({ host, port: Number(port), user, password: password || undefined, database });

const targetEmail = 'abdoul172002@gmail.com';
const [[u]] = await conn.execute('SELECT id, email FROM `user` WHERE email = ?', [targetEmail]);

if (!u) {
  console.log('Compte introuvable :', targetEmail);
  await conn.end();
  process.exit(0);
}

console.log(`Suppression de : ${u.email} (${u.id})`);

await conn.execute('DELETE FROM `account` WHERE userId = ?', [u.id]);
console.log('✅ account supprimé');

await conn.execute('DELETE FROM `session` WHERE userId = ?', [u.id]);
console.log('✅ session supprimée');

await conn.execute('DELETE FROM `user` WHERE id = ?', [u.id]);
console.log('✅ user supprimé');

const [remaining] = await conn.execute('SELECT email, role FROM `user`');
console.log('\n📊 Comptes restants :');
remaining.forEach(r => console.log(`   ✔ ${r.email} [${r.role}]`));

await conn.end();
console.log('\n🎉 Done.');
