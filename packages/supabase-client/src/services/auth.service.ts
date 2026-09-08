import type { CareLinkSupabaseClient } from '../client';

export class AuthService {
  constructor(private client: CareLinkSupabaseClient) {}
  get supabase() { return this.client; }
}
