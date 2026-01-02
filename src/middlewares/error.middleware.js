export const errorHandler = (err, req, res, next) => {
    const isMulterError = err?.name === 'MulterError';
    const isUploadValidation = typeof err?.message === 'string' && (
        err.message.includes('Formato no válido') ||
        err.message.toLowerCase().includes('file too large')
    );

    const status = Number(err?.status) || (isMulterError || isUploadValidation ? 400 : 500);
    const message = err?.message || 'Error interno del servidor';

    if (status >= 500) {
        console.error(err);
    }

    const payload = { error: message };
    if (err?.details !== undefined) payload.details = err.details;

    res.status(status).json(payload);
};