import 'dotenv/config';
import mysql from 'mysql2/promise';

const DB_URL = process.env.MYSQL_DATABASE_URL;
const match = DB_URL.match(/mysql:\/\/([^:]*):([^@]*)@([^:]+):(\d+)\/(.+)/);
const [, user, password, host, port, database] = match;

const conn = await mysql.createConnection({ host, port: Number(port), user, password: password || undefined, database });

// L'admin qui reste
const adminUserId = 'EKWjfHAjBZdglJReYhjo5CLTkMi9T4N0'; // githubabdoul@gmail.com

// Voir la structure de la table pour savoir quelle colonne lie à user
const [cols] = await conn.execute('DESCRIBE `profiles`');
console.log('Colonnes de profiles :', cols.map(c => c.Field));

// Compter avant
const [[{ total }]] = await conn.execute('SELECT COUNT(*) as total FROM `profiles`');
console.log(`\n📊 Profils actuels : ${total}`);

// Afficher ce qui va être supprimé
const [toDelete] = await conn.execute('SELECT * FROM `profiles`');
console.log('Profils existants :');
toDelete.forEach(p => console.log('  -', JSON.stringify(p).substring(0, 120)));

// Supprimer tous sauf l'admin (essai avec userId puis id)
let deleted = 0;
try {
  const [r] = await conn.execute('DELETE FROM `profiles` WHERE userId != ?', [adminUserId]);
  deleted = r.affectedRows;
} catch {
  try {
    const [r] = await conn.execute('DELETE FROM `profiles` WHERE id != ?', [adminUserId]);
    deleted = r.affectedRows;
  } catch {
    // Si pas de lien direct, vider complètement sauf l'admin via email
    const [r] = await conn.execute(
      'DELETE FROM `profiles` WHERE email NOT IN (SELECT email FROM `user` WHERE id = ?)',
      [adminUserId]
    );
    deleted = r.affectedRows;
  }
}

console.log(`\n✅ profiles : ${deleted} ligne(s) supprimée(s)`);

const [[{ remaining }]] = await conn.execute('SELECT COUNT(*) as remaining FROM `profiles`');
console.log(`📊 Profils restants : ${remaining}`);

await conn.end();
console.log('🎉 Done.');
