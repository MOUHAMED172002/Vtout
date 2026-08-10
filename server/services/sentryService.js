import * as Sentry from '@sentry/node';

// Wiring optionnel : reste un no-op tant que SENTRY_DSN n'est pas défini
// dans l'environnement. Dès que le compte Sentry est créé et le DSN
// renseigné, les erreurs serveur (exceptions non catchées, rejets de
// promesses, erreurs passées au middleware errorHandler) remontent
// automatiquement au tableau de bord Sentry au lieu de dépendre
// exclusivement d'une lecture manuelle des logs — plusieurs bugs de cette
// session (stock jamais restauré pour les variantes, double décrément,
// parsing de réponse FedaPay) sont restés invisibles en prod un moment
// avant d'être repérés par hasard dans les logs.
const dsn = process.env.SENTRY_DSN;
export const sentryEnabled = !!dsn;

if (dsn) {
    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.1
    });
    console.log('[Sentry] Monitoring des erreurs activé.');
} else {
    console.log('[Sentry] SENTRY_DSN absent — monitoring désactivé (no-op). Voir README pour l\'activer.');
}

export const captureException = (err, context = {}) => {
    if (!dsn) return;
    try {
        Sentry.captureException(err, { extra: context });
    } catch { /* jamais faire planter l'appelant à cause du monitoring lui-même */ }
};

export default Sentry;
