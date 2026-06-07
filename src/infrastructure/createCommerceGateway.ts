import type { CommerceGateway } from "../application/ports/CommerceGateway";
import { LocalCommerceGateway } from "./local/LocalCommerceGateway";
import { SupabaseCommerceGateway } from "./supabase/SupabaseCommerceGateway";

export function createCommerceGateway(): CommerceGateway {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    return new SupabaseCommerceGateway(supabaseUrl, supabaseAnonKey);
  }

  return new LocalCommerceGateway();
}
