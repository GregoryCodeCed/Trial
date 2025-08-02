
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCryptoPrices, CryptoData } from "@/services/cryptoService";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 4;

const CryptoHero = () => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const { data: cryptoData = [], isLoading, error, isFetching } = useQuery({
    queryKey: ['cryptoPrices'],
    queryFn: fetchCryptoPrices,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
    retry: 3, // Automatically retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  const totalPages = Math.ceil(cryptoData.length / ITEMS_PER_PAGE);
  
  useEffect(() => {
    if (totalPages > 0) {
      const interval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }, 3000); // Auto-scroll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [totalPages]);

  const nextSlide = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleCrypto = cryptoData.slice(
    currentPage * ITEMS_PER_PAGE, 
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  if (error && !cryptoData.length) {
    return (
      <section className="text-white">
        <div className="flex items-center justify-center mb-8">
          <h2 className="text-2xl font-bold mr-4">The Platform Offers</h2>
          <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
        </div>
        <div className="text-center text-gray-400">
          <p>Loading cryptocurrency data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="text-white">
      <div className="flex items-center justify-center mb-8">
        <h2 className="text-2xl font-bold mr-4">The Platform Offers</h2>
        {(isLoading || isFetching) && (
          <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
        )}
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center justify-center space-x-6 overflow-hidden">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
            disabled={isLoading}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
            {isLoading && !cryptoData.length ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <Skeleton key={index} className="h-32 bg-slate-800 rounded-lg" />
              ))
            ) : (
              visibleCrypto.map((crypto, index) => (
                <div
                  key={`${crypto.symbol}-${index}`}
                  className="bg-slate-800 rounded-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:bg-slate-700"
                >
                  <div className="mb-2 flex justify-center">
                    <img 
                      src={crypto.imageUrl} 
                      alt={`${crypto.name} logo`}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        // Fallback to unicode icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                    <span className={`text-4xl ${crypto.color} hidden`}>
                      {crypto.icon}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{crypto.name.split(' (')[0]}</h3>
                  <p className={`text-sm mb-2 ${crypto.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.change}
                  </p>
                  <p className="text-xl font-bold">{crypto.price}</p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
            disabled={isLoading}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {totalPages > 0 && (
          <div className="flex justify-center mt-6">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 mx-1 rounded-full ${
                  currentPage === index ? 'bg-orange-400' : 'bg-slate-600'
                }`}
                disabled={isLoading}
              ></button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CryptoHero;
