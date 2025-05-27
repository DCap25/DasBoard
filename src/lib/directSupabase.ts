// Direct Supabase REST API wrapper to bypass client timeout issues
// This uses direct fetch calls which we know work reliably

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration for direct API calls');
}

const baseHeaders = {
  Authorization: `Bearer ${supabaseKey}`,
  apikey: supabaseKey,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

export interface DirectSupabaseResponse<T = any> {
  data: T | null;
  error: any;
  count?: number;
}

class DirectSupabaseClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${supabaseUrl}/rest/v1`;
    this.headers = { ...baseHeaders };
  }

  // SELECT operations
  async select<T = any>(
    table: string,
    query: {
      columns?: string;
      filter?: Record<string, any>;
      limit?: number;
      offset?: number;
      orderBy?: { column: string; ascending?: boolean };
    } = {}
  ): Promise<DirectSupabaseResponse<T[]>> {
    try {
      const params = new URLSearchParams();

      if (query.columns) {
        params.append('select', query.columns);
      }

      if (query.limit) {
        params.append('limit', query.limit.toString());
      }

      if (query.offset) {
        params.append('offset', query.offset.toString());
      }

      if (query.orderBy) {
        const order = query.orderBy.ascending === false ? 'desc' : 'asc';
        params.append('order', `${query.orderBy.column}.${order}`);
      }

      // Add filters
      if (query.filter) {
        Object.entries(query.filter).forEach(([key, value]) => {
          params.append(key, `eq.${value}`);
        });
      }

      const url = `${this.baseUrl}/${table}?${params}`;
      console.log('[DirectSupabase] SELECT request:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: null,
          error: {
            message: `HTTP ${response.status}: ${errorText}`,
            status: response.status,
          },
        };
      }

      const data = await response.json();
      console.log('[DirectSupabase] SELECT success:', data);

      return {
        data: data,
        error: null,
      };
    } catch (error) {
      console.error('[DirectSupabase] SELECT error:', error);
      return {
        data: null,
        error: error,
      };
    }
  }

  // INSERT operations
  async insert<T = any>(table: string, data: any): Promise<DirectSupabaseResponse<T>> {
    try {
      const url = `${this.baseUrl}/${table}`;
      console.log('[DirectSupabase] INSERT request:', url, data);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: null,
          error: {
            message: `HTTP ${response.status}: ${errorText}`,
            status: response.status,
          },
        };
      }

      const result = await response.json();
      console.log('[DirectSupabase] INSERT success:', result);

      return {
        data: Array.isArray(result) ? result[0] : result,
        error: null,
      };
    } catch (error) {
      console.error('[DirectSupabase] INSERT error:', error);
      return {
        data: null,
        error: error,
      };
    }
  }

  // DELETE operations
  async delete<T = any>(
    table: string,
    filter: Record<string, any>
  ): Promise<DirectSupabaseResponse<T>> {
    try {
      const params = new URLSearchParams();

      // Add filters
      Object.entries(filter).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });

      const url = `${this.baseUrl}/${table}?${params}`;
      console.log('[DirectSupabase] DELETE request:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: null,
          error: {
            message: `HTTP ${response.status}: ${errorText}`,
            status: response.status,
          },
        };
      }

      const result = await response.text();
      console.log('[DirectSupabase] DELETE success');

      return {
        data: null, // DELETE typically doesn't return data
        error: null,
      };
    } catch (error) {
      console.error('[DirectSupabase] DELETE error:', error);
      return {
        data: null,
        error: error,
      };
    }
  }

  // UPDATE operations
  async update<T = any>(
    table: string,
    data: any,
    filter: Record<string, any>
  ): Promise<DirectSupabaseResponse<T>> {
    try {
      const params = new URLSearchParams();

      // Add filters
      Object.entries(filter).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });

      const url = `${this.baseUrl}/${table}?${params}`;
      console.log('[DirectSupabase] UPDATE request:', url, data);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: null,
          error: {
            message: `HTTP ${response.status}: ${errorText}`,
            status: response.status,
          },
        };
      }

      const result = await response.json();
      console.log('[DirectSupabase] UPDATE success:', result);

      return {
        data: Array.isArray(result) ? result[0] : result,
        error: null,
      };
    } catch (error) {
      console.error('[DirectSupabase] UPDATE error:', error);
      return {
        data: null,
        error: error,
      };
    }
  }

  // Helper method to test the connection
  async testConnection(): Promise<DirectSupabaseResponse<any>> {
    return this.select('dealerships', {
      columns: 'id,name',
      limit: 1,
    });
  }
}

// Export a singleton instance
export const directSupabase = new DirectSupabaseClient();

// Export the class for custom instances if needed
export { DirectSupabaseClient };
