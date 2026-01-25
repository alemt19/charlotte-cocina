import { supabase } from '../libs/supabase.js';
import { envs } from '../config/envs.js';
import path from 'path';

/**
 * Sube un archivo al bucket de Supabase
 * @param {Object} file - Objeto file de Multer (debe estar en memoria/buffer)
 * @returns {Promise<string>} - URL pública del archivo
 */
export const uploadImageToSupabase = async (file) => {
    if (!file || !file.buffer) {
        throw new Error('No se recibió el buffer del archivo');
    }

    // Generar nombre único
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    
    // Subir a Supabase
    // envs.SUPABASE_BUCKET_NAME default is 'products'
    const { data, error } = await supabase.storage
        .from(envs.SUPABASE_BUCKET_NAME)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        console.error('Error subiendo a Supabase:', error);
        throw new Error(`Error subiendo imagen: ${error.message}`);
    }

    // Obtener URL Pública
    const { data: publicUrlData } = supabase.storage
        .from(envs.SUPABASE_BUCKET_NAME)
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
};
