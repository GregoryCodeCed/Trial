
import CryptoHero from "@/components/CryptoHero";
import CryptoPricesTable from "@/components/CryptoPricesTable";
import ServiceCards from "@/components/ServiceCards";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-orange-400 text-center">
            Crypto Fix Platform
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        <CryptoHero />
        <CryptoPricesTable />
        <ServiceCards />
      </main>
    </div>
  );
};

export default Index;
