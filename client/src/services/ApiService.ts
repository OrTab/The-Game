class ApiService {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, options);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async get<T = any>(url: string): Promise<T> {
    return this.makeRequest<T>(url);
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService('http://127.0.0.1:4001/');
