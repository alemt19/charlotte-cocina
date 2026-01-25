
export const envs = {
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

    SECURITY_BASE_URL: process.env.SECURITY_BASE_URL,
    SECURITY_HAS_PERMISSION_PATH:
        process.env.SECURITY_HAS_PERMISSION_PATH || '/api/seguridad/auth/hasPermission',
    API_URL: process.env.API_URL || 'http://localhost:3000',

    ATENCION_CLIENTE_API_URL: process.env.ATENCION_CLIENTE_API_URL || process.env.API_URL || 'http://localhost:3000',
    DELIVERY_PICKUP_API_URL: process.env.DELIVERY_PICKUP_API_URL || process.env.API_URL || 'http://localhost:3000',

    // Supabase Storage Credentials
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME || 'products',
};
