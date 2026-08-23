import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  var _supabaseAdmin: SupabaseClient | undefined;
  var _supabaseAnon: SupabaseClient | undefined;
}

/**
 * Verifica si las variables de entorno de Supabase están presentes.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  return Boolean(url && serviceKey);
}

/**
 * Obtiene el cliente Supabase Admin con service_role (para operaciones de servidor seguras).
 * Bypasses RLS para operaciones administrativas, transacciones de checkout y webhooks de pago.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tus variables de entorno.",
    );
  }

  if (!global._supabaseAdmin) {
    global._supabaseAdmin = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return global._supabaseAdmin;
}

/**
 * Obtiene el cliente público Supabase (con anon key) para operaciones en cliente si se requiere.
 */
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tus variables de entorno.",
    );
  }

  if (!global._supabaseAnon) {
    global._supabaseAnon = createClient(url, key);
  }

  return global._supabaseAnon;
}
