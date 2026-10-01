import { useState, useEffect, useRef } from 'react';

// Cache simple para almacenar respuestas de API
const cache = new Map();

// Hook para cachear llamadas a API
export const useApiCache = (key, apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortController = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      // Verificar si los datos están en cache
      if (cache.has(key)) {
        const cachedData = cache.get(key);
        if (Date.now() - cachedData.timestamp < 300000) { // 5 minutos
          setData(cachedData.data);
          setLoading(false);
          return;
        } else {
          // Cache expirado, eliminar
          cache.delete(key);
        }
      }

      try {
        setLoading(true);
        setError(null);
        
        // Cancelar petición anterior si existe
        if (abortController.current) {
          abortController.current.abort();
        }
        
        abortController.current = new AbortController();
        
        const response = await apiCall();
        
        if (isMounted) {
          setData(response);
          // Guardar en cache
          cache.set(key, {
            data: response,
            timestamp: Date.now()
          });
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para invalidar cache
  const invalidateCache = () => {
    cache.delete(key);
  };

  // Función para refrescar datos
  const refresh = async () => {
    cache.delete(key);
    setLoading(true);
    try {
      const response = await apiCall();
      setData(response);
      cache.set(key, {
        data: response,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh, invalidateCache };
};

// Hook para debounce de búsquedas
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para paginación
export const usePagination = (initialPage = 1, initialPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const updatePagination = (total, pages) => {
    setTotalItems(total);
    setTotalPages(pages);
  };

  return {
    currentPage,
    perPage,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    setPerPage,
    updatePagination,
    setCurrentPage
  };
};

// Limpiar todo el cache
export const clearCache = () => {
  cache.clear();
};

// Limpiar cache por patrón
export const clearCachePattern = (pattern) => {
  const regex = new RegExp(pattern);
  const keysToDelete = [];
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => cache.delete(key));
};
