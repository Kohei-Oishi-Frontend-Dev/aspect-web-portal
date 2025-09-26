import { useState, useEffect, useCallback } from 'react';
import { AddressService } from '../api/services/address';

export type AddressSuggestion = {
  id: string;
  text: string; // corresponds to "Text" in API
  description?: string; // corresponds to "Description" in API
};

export const useAddressSearch = (query: string, debounceMs = 300) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      setIsLoading(true);
      // Expect AddressService.searchAddresses to return AddressSuggestion[]
      const results = await AddressService.searchAddresses(searchQuery);
      console.log("results are", results);
      // If results come back as raw objects, ensure they match the shape
      const mapped: AddressSuggestion[] = (results as unknown[]).map((it) => ({
        id: it?.Id ?? '',
        text: it?.Text ?? '',
        description: it?.Description ?? '',
      }));
      setSuggestions(mapped);
      console.log('address search results', mapped);
    } catch (err) {
      console.error('Address search error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // clear suggestions when query is empty
    if (!query || !query.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchAddresses(query);
    }, debounceMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [query, debounceMs, searchAddresses]);

  return { suggestions, isLoading };
};