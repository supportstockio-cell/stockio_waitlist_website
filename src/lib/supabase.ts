import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client.
 *
 * The URL and publishable key are committed as defaults on purpose. They are
 * not secrets: NEXT_PUBLIC_* values are compiled into the JavaScript every
 * visitor downloads, so this key is already public the moment the site ships.
 * Supabase calls it "publishable" for exactly that reason.
 *
 * What protects the data is Row Level Security, not secrecy. Verified against
 * production with this key alone:
 *   reading waitlist      -> 401
 *   reading the admin hash-> 401
 *   deleting rows         -> 401
 *   admin RPC, wrong pw   -> 403
 * The only thing it permits is inserting a signup, which the public form does
 * anyway.
 *
 * Committing them means any deploy works with zero dashboard configuration.
 * Environment variables still win where they are set, so a different Supabase
 * project can be pointed at without touching this file. To rotate the key,
 * roll it in Supabase and update the default below.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://ckhgfcqpqlrucovefyjx.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_LQGaOo3yrbDxm73oiNUWuw_BTNOr47b";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
