
import { useState } from "react";
import { DollarSign } from "lucide-react";
import WalletConnectionModal from "@/components/WalletConnectionModal";

const services = [
  {
    title: "Migration Issues",
    description: "Click here for migration related issues",
    icon: "🌤️",
    category: "migration"
  },
  {
    title: "Validation",
    description: "Click here for validation issues",
    icon: "💳",
    category: "validation"
  },
  {
    title: "Wallet Synchronization",
    description: "Click here for wallet synchronization issues",
    icon: "🔧",
    category: "general"
  },
  {
    title: "Rectification",
    description: "Click here for rectification related issues",
    icon: "🏛️",
    category: "rectification"
  },
  {
    title: "Gas Fees",
    description: "Click here for gas fee related issues",
    icon: "⛽",
    category: "gas"
  },
  {
    title: "Claim Reward",
    description: "Click here for claim reward issues",
    icon: "💰",
    category: "claim"
  },
  {
    title: "Deposits/Withdrawals",
    description: "Click here for deposits/withdrawal issues",
    icon: "🏦",
    category: "deposits"
  },
  {
    title: "Staking Issues",
    description: "Click here for staking related issues",
    iconComponent: DollarSign,
    category: "staking"
  },
  {
    title: "Swap/Exchange",
    description: "Click here for swap/Exchange issues",
    icon: "🔄",
    category: "swap"
  },
  {
    title: "Connect to Dapps",
    description: "Click here for Dapp connection related issues",
    icon: "🔗",
    category: "dapps"
  },
  {
    title: "Missing/Irregular Balance",
    description: "Click here for missing/irregular balance issues",
    icon: "📉",
    category: "balance"
  },
  {
    title: "Login Issues",
    description: "Click here for login related issues",
    icon: "🔑",
    category: "login"
  },
  {
    title: "Transaction Errors",
    description: "Click here for transaction error issues",
    icon: "💸",
    category: "transaction"
  },
  {
    title: "Security Concerns",
    description: "Click here for security related issues",
    icon: "🔒",
    category: "security"
  },
  {
    title: "NFT Issues",
    description: "Click here for NFT related issues",
    icon: "🎨",
    category: "nft"
  },
  {
    title: "Asset Recovery",
    description: "Click here for asset recovery issues",
    icon: "🔄",
    category: "asset-recovery"
  },
  {
    title: "Buy and Sell",
    description: "Click here for buy and sell issues",
    icon: "💱",
    category: "buy-sell"
  },
  {
    title: "Slippage Error",
    description: "Click here for slippage error issues",
    icon: "⚠️",
    category: "slippage"
  },
  {
    title: "Transaction Delay",
    description: "Click here for transaction delay issues",
    icon: "⏰",
    category: "transaction-delay"
  },
  {
    title: "Liquidity Issue",
    description: "Click here for liquidity related issues",
    icon: "💧",
    category: "liquidity"
  },
  {
    title: "Cross Chain Transfer",
    description: "Click here for cross chain transfer issues",
    icon: "🔗",
    category: "cross-chain"
  },
  {
    title: "Claim Airdrop",
    description: "Click here for airdrop claim issues",
    icon: "🪂",
    category: "airdrop"
  },
  {
    title: "Token Bridge",
    description: "Click here for token bridge issues",
    icon: "🌉",
    category: "token-bridge"
  },
  {
    title: "Unable to Buy Coins/Tokens",
    description: "Click here for coin/token purchase issues",
    icon: "🚫",
    category: "unable-buy"
  },
  {
    title: "Trading Wallet Issues",
    description: "Click here for trading wallet issues",
    icon: "📊",
    category: "trading-wallet"
  },
  {
    title: "Locked Account",
    description: "Click here for locked account issues",
    icon: "🔐",
    category: "locked-account"
  },
  {
    title: "Whitelist",
    description: "Click here for whitelist related issues",
    icon: "📋",
    category: "whitelist"
  },
  {
    title: "KYC",
    description: "Click here for KYC related issues",
    icon: "👤",
    category: "kyc"
  },
  {
    title: "Other Issues",
    description: "Talk to a customer support representative",
    icon: "💬",
    category: "other"
  }
];

const ServiceCards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const handleServiceClick = (service: string) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <section className="text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            onClick={() => handleServiceClick(service.title)}
            className="bg-slate-700 hover:bg-slate-600 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:scale-105 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
              {service.iconComponent ? (
                <service.iconComponent className="w-10 h-10 mx-auto text-green-400" />
              ) : (
                service.icon
              )}
            </div>
            <h3 className="font-bold text-lg mb-2">{service.title}</h3>
            <p className="text-sm text-gray-300">{service.description}</p>
          </div>
        ))}
      </div>

      <WalletConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedService={selectedService}
      />
    </section>
  );
};

export default ServiceCards;
