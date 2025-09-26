import { ApiClient } from "../client";

export interface AddressSuggestion {
  text: string;
  id?: string;
}

export interface AddressLookupResponse {
  Items?: AddressSuggestion[];
  Results?: AddressSuggestion[];
  Places?: AddressSuggestion[];
}

export class AddressService {
  // prefer environment variables set via Vite; fall back to the previous hardcoded defaults
  private static readonly API_KEY =
    (import.meta.env.VITE_ADDRESSY_API_KEY as string);
  private static readonly BASE_URL =
    (import.meta.env.VITE_ADDRESSY_BASE_URL as string);

  static async searchAddresses(query: string): Promise<string[]> {
    if (!query.trim()) return [];
    console.log("address.ts working")
    const params = new URLSearchParams({
      Key: this.API_KEY,
      Text: query.trim(),
    });

    // use ApiClient so this call benefits from shared headers / error handling
    const api = new ApiClient(this.BASE_URL);
    try {
      const res = await api.get<AddressLookupResponse>(`?${params.toString()}`);
      const data = res.data
      const items = data?.Items?? [];
      return items
    } catch (err) {
      // keep behaviour: throw so callers can handle errors
      console.error("AddressService.searchAddresses error:", err);
      throw err;
    }
  }
}