/**
 * Centralized Error Handler Middleware
 * In production: hides internal error details from API responses (prevents info leakage).
 * In development: includes full details for debugging.
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const errorHandler = (err, req, res, next) => {
    // Always log full error server-side
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

    const statusCode = err.statusCode || err.status || 500;

    if (IS_PRODUCTION) {
        // In production: never expose internals
        return res.status(statusCode).json({
            error: err.userMessage || 'Une erreur interne est survenue. Veuillez réessayer.'
        });
    }

    // In development: include details for debugging
    return res.status(statusCode).json({
        error: err.userMessage || err.message || 'Erreur interne',
        details: err.message,
        stack: err.stack
    });
};

/**
 * Helper to safely send error responses from controllers.
 * Usage: return sendError(res, 500, 'Message visible', error)
 */
export const sendError = (res, status, userMessage, err = null) => {
    if (err) console.error(`[ERROR ${status}] ${userMessage}`, err);

    if (IS_PRODUCTION) {
        return res.status(status).json({ error: userMessage });
    }

    return res.status(status).json({
        error: userMessage,
        details: err?.message
    });
};
