
import { useState } from "react";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCryptoPrices } from "@/services/cryptoService";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const ITEMS_PER_PAGE = 10;

const CryptoPricesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useIsMobile();

  const { data: cryptoTableData = [], isLoading, error, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['cryptoPricesTable'],
    queryFn: fetchCryptoPrices,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
    retry: 3, // Automatically retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  const filteredData = cryptoTableData.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  
  const visibleData = filteredData.slice(
    currentPage * ITEMS_PER_PAGE, 
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '';

  // Generate page numbers to display based on screen size
  const getVisiblePages = () => {
    const maxVisiblePages = isMobile ? 3 : 10;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is within limit
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (isMobile) {
        // Mobile: Show current page ± 1 (max 3 pages)
        const startPage = Math.max(1, currentPage + 1 - 1);
        const endPage = Math.min(totalPages, startPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      } else {
        // Desktop: Show first 10 pages
        for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <section className="text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Cryptocurrency Prices by Market Cap</h2>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-400">Last updated: {lastUpdated}</span>
          )}
          {(isLoading || isFetching) && (
            <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search For a Crypto Currency"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0); // Reset to first page when searching
            }}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>
      </div>

      {error && !cryptoTableData.length ? (
        <div className="text-center text-gray-400 py-8">
          <div className="flex items-center justify-center mb-2">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <p>Loading cryptocurrency data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-700 font-semibold">
              <div>Coin</div>
              <div>Price</div>
              <div>24h Change</div>
              <div>Market Cap</div>
            </div>
            
            <div className="divide-y divide-slate-700">
              {isLoading && !cryptoTableData.length ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full bg-slate-600" />
                      <Skeleton className="h-4 w-32 bg-slate-600" />
                    </div>
                    <Skeleton className="h-4 w-20 bg-slate-600" />
                    <Skeleton className="h-4 w-16 bg-slate-600" />
                    <Skeleton className="h-4 w-28 bg-slate-600" />
                  </div>
                ))
              ) : (
                visibleData.map((crypto, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 hover:bg-slate-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <img 
                          src={crypto.imageUrl} 
                          alt={`${crypto.name} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback to unicode icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                        <span className={`text-2xl ${crypto.color} hidden`}>
                          {crypto.icon}
                        </span>
                      </div>
                      <span className="font-medium">{crypto.name}</span>
                    </div>
                    <div className="font-semibold">{crypto.price}</div>
                    <div className={`font-medium ${crypto.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {crypto.change}
                    </div>
                    <div className="text-gray-300">{crypto.marketCap}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Responsive Pagination */}
          {totalPages > 0 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                {/* Previous Button - Show on mobile or when not on first page */}
                {(isMobile || currentPage > 0) && (
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0 || isLoading}
                    className={`${
                      isMobile ? 'w-10 h-10' : 'px-3 py-2'
                    } rounded flex items-center justify-center ${
                      currentPage === 0 
                        ? 'bg-slate-600 text-gray-500 cursor-not-allowed' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    } transition-colors`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {!isMobile && <span className="ml-1">Prev</span>}
                  </button>
                )}

                {/* Page Numbers */}
                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page - 1)}
                    className={`${
                      isMobile ? 'w-10 h-10' : 'w-10 h-10'
                    } rounded ${
                      currentPage === page - 1
                        ? 'bg-orange-400 text-white' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    } transition-colors`}
                    disabled={isLoading}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button - Show on mobile or when not on last page */}
                {(isMobile || currentPage < totalPages - 1) && (
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1 || isLoading}
                    className={`${
                      isMobile ? 'w-10 h-10' : 'px-3 py-2'
                    } rounded flex items-center justify-center ${
                      currentPage >= totalPages - 1 
                        ? 'bg-slate-600 text-gray-500 cursor-not-allowed' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    } transition-colors`}
                  >
                    {!isMobile && <span className="mr-1">Next</span>}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CryptoPricesTable;
