export const errorHandler = (err, req, res, next) => {
    const status = Number(err?.status) || 500;
    const message = err?.message || 'Error interno del servidor';

    if (status >= 500) {
        console.error(err);
    }

    const payload = { error: message };
    if (err?.details !== undefined) payload.details = err.details;

    res.status(status).json(payload);
};