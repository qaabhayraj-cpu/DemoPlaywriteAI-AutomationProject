import { ApiClient } from '@api/ApiClient';
import { EmployeeData } from '@types';
import { EmployeeListSchema, EmployeeSchema } from '@api/schemas/EmployeeSchema';

export class EmployeeApi {
  constructor(private client: ApiClient) {}

  async getAll(): Promise<import('@api/schemas/EmployeeSchema').Employee[]> {
    const response = await this.client.get<unknown>('/web/index.php/api/v2/pim/employees');
    const raw = response.data;
    const arr = this.extractArrayFromResponse(raw);
    return arr.map((item) => this.client.validateSchema(item, EmployeeSchema));
  }

  async getById(id: number): Promise<import('@api/schemas/EmployeeSchema').Employee> {
    const response = await this.client.get<unknown>(`/web/index.php/api/v2/pim/employees/${id}`);
    return this.client.validateSchema(response.data, EmployeeSchema);
  }

  async search(name: string): Promise<import('@api/schemas/EmployeeSchema').Employee[]> {
    const response = await this.client.get<unknown>('/web/index.php/api/v2/pim/employees', { q: name });
    const raw = response.data;
    const arr = this.extractArrayFromResponse(raw);
    return arr.map((item) => this.client.validateSchema(item, EmployeeSchema));
  }

  async create(data: Partial<EmployeeData>): Promise<import('@api/schemas/EmployeeSchema').Employee> {
    const response = await this.client.post<unknown>('/web/index.php/api/v2/pim/employees', data);
    return this.client.validateSchema(response.data, EmployeeSchema);
  }

  async update(id: number, data: Partial<EmployeeData>): Promise<import('@api/schemas/EmployeeSchema').Employee> {
    const response = await this.client.put<unknown>(`/web/index.php/api/v2/pim/employees/${id}`, data);
    return this.client.validateSchema(response.data, EmployeeSchema);
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/web/index.php/api/v2/pim/employees/${id}`);
  }

  private extractArrayFromResponse(raw: unknown): unknown[] {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      const commonKeys = ['data', 'result', 'items', 'employees', 'records', 'list', 'rows'];

      for (const key of commonKeys) {
        const val = obj[key];
        if (Array.isArray(val)) return val as unknown[];
        if (val && typeof val === 'object') {
          const nested = val as Record<string, unknown>;
          for (const k2 of commonKeys) {
            if (Array.isArray(nested[k2])) return nested[k2] as unknown[];
          }
        }
      }

      // Fallback: return first array found in object values (shallow then one-level nested)
      for (const v of Object.values(obj)) {
        if (Array.isArray(v)) return v as unknown[];
        if (v && typeof v === 'object') {
          for (const vv of Object.values(v as Record<string, unknown>)) {
            if (Array.isArray(vv)) return vv as unknown[];
          }
        }
      }
    }

    throw new Error('Unable to extract employee list array from API response');
  }
}
