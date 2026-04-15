import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';
import { customerApi } from '../api/customerApi';
import { invoiceApi } from '../api/invoiceApi';
import { ProductResponse } from '../types/product.types';
import { CustomerResponse } from '../types/customer.types';
import { InvoiceResponse } from '../types/invoice.types';

export type SearchResult = 
  | { type: 'PRODUCT', data: ProductResponse }
  | { type: 'CUSTOMER', data: CustomerResponse }
  | { type: 'INVOICE', data: InvoiceResponse };

export const useGlobalSearch = (keyword: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [productsRes, customersRes] = await Promise.all([
        productApi.getAll({ search: term, size: 5 }),
        customerApi.getAll({ search: term, size: 5 })
      ]);

      // Invoices matching term (invoice number)
      let invoice: InvoiceResponse | null = null;
      try {
        // This assumes we have a findByInvoiceNumber or just search by ID if it's a UUID
        // For simplicity, let's try to fetch by ID or skip if term doesn't look like an ID/Number
        if (term.length > 5) {
           const invoicesRes = await invoiceApi.getAll({ size: 5 });
           // Filter locally for now as there's no dedicated invoice search endpoint yet
           const matchedInvoices = invoicesRes.data.content.filter(i => 
             i.invoiceNumber.toLowerCase().includes(term.toLowerCase())
           );
           
           const combined: SearchResult[] = [
             ...productsRes.data.content.map(p => ({ type: 'PRODUCT', data: p } as SearchResult)),
             ...customersRes.data.content.map(c => ({ type: 'CUSTOMER', data: c } as SearchResult)),
             ...matchedInvoices.map(i => ({ type: 'INVOICE', data: i } as SearchResult))
           ];
           setResults(combined);
        } else {
           const combined: SearchResult[] = [
             ...productsRes.data.content.map(p => ({ type: 'PRODUCT', data: p } as SearchResult)),
             ...customersRes.data.content.map(c => ({ type: 'CUSTOMER', data: c } as SearchResult))
           ];
           setResults(combined);
        }
      } catch (e) {
        // Fallback if invoice fetch fails
        const combined: SearchResult[] = [
          ...productsRes.data.content.map(p => ({ type: 'PRODUCT', data: p } as SearchResult)),
          ...customersRes.data.content.map(c => ({ type: 'CUSTOMER', data: c } as SearchResult))
        ];
        setResults(combined);
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(keyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, performSearch]);

  return { results, isLoading };
};
