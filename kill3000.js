const cp = require('child_process');

cp.exec('netstat -ano', (err, stdout) => {
    if (stdout) {
        const lines = stdout.split('\n');
        let killed = false;
        lines.forEach(line => {
            if (line.includes(':3000') && line.includes('LISTENING')) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') {
                    console.log('Trouvé processus sur le port 3000 avec le PID:', pid);
                    try {
                        cp.execSync('taskkill /PID ' + pid + ' /F');
                        console.log('Processus ' + pid + ' terminé avec succès.');
                        killed = true;
                    } catch (e) {
                        console.error('Erreur lors de la fermeture du processus ' + pid, e.message);
                    }
                }
            }
        });
        if (!killed) {
            console.log("Aucun processus trouvé ou aucun n'a pu être tué.");
        }
    }
});
