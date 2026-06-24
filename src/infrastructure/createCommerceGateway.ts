import type { CommerceGateway } from "../application/ports/CommerceGateway";
import { LocalCommerceGateway } from "./local/LocalCommerceGateway";
import { SupabaseCommerceGateway } from "./supabase/SupabaseCommerceGateway";

export function createCommerceGateway(): CommerceGateway {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    console.info("[SAVIS] Commerce gateway: Supabase", new URL(supabaseUrl).host);
    return new SupabaseCommerceGateway(supabaseUrl, supabaseAnonKey);
  }

  console.info("[SAVIS] Commerce gateway: local fallback");
  return new LocalCommerceGateway();
}
