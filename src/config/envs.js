
export const envs = {
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

    SECURITY_BASE_URL: process.env.SECURITY_BASE_URL,
    SECURITY_HAS_PERMISSION_PATH:
        process.env.SECURITY_HAS_PERMISSION_PATH || '/api/seguridad/auth/hasPermission',
};
