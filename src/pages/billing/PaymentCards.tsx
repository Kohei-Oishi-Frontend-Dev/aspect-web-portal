import React from "react";
import Button from "../../components/Button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignCircleIcon,
  InformationSquareIcon,
} from "@hugeicons/core-free-icons";
import visaLogo from "../../assets/visa-logo.svg";
import mastercardLogo from "../../assets/mastercard-logo.svg";
import amexLogo from "../../assets/amex-logo.svg";

// Interface for card data coming from the API
interface ApiCard {
  id: string;
  name: string;
  cardType: string;
  accountReferenceNumber: string; // Last 4 digits
  expiryDate: string; // e.g., "2033-01-31"
  // Assuming 'isDefault' logic might be handled differently or is not present in API
  // We'll treat the first card as default for this example.
}

interface PaymentCardsProps {
  cards: ApiCard[];
}

const PaymentCards: React.FC<PaymentCardsProps> = ({ cards }) => {
  const handleAddCard = () => {
    console.log("Add payment card clicked");
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return (
          <img src={visaLogo} alt="Visa" className="w-10 h-6 object-contain" />
        );
      case "mastercard":
        return (
          <img
            src={mastercardLogo}
            alt="Mastercard"
            className="w-10 h-6 object-contain"
          />
        );
      case "american express":
        return (
          <img
            src={amexLogo}
            alt="American Express"
            className="w-10 h-6 object-contain"
          />
        );
      default:
        // You can add more cases for 'Discover', etc.
        return (
          <div className="w-10 h-6 bg-gray-300 rounded flex items-center justify-center text-xs">
            💳
          </div>
        );
    }
  };

  // Format expiry date from "YYYY-MM-DD" to "MM/YY"
  const formatExpiryDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${year}`;
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Payment Cards</h2>
      </div>

      {cards.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`border rounded-lg p-4 ${
                  // Using first card as default for styling example
                  index === 0
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getCardBrandIcon(card.cardType)}
                    </span>
                  </div>
                  <div className="">
                    <p>Card ending **** {card.accountReferenceNumber}</p>
                    <p className="text-sm text-gray-600">
                      Expiry date: {formatExpiryDate(card.expiryDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleAddCard} variant="outline">
              <div className="flex items-center justify-center gap-2">
                <HugeiconsIcon icon={PlusSignCircleIcon} className="w-6 h-6" />
              </div>
            </Button>
            <p>Add a Payment Card</p>
          </div>
        </>
      ) : (
        <div className="py-4 flex flex-col gap-8">
          <div className="flex items-center gap-2 bg-background rounded-md p-4">
            <HugeiconsIcon
              icon={InformationSquareIcon}
              className="w-8 h-8 text-primary"
            />
            <p>
              <b>You do not have a pre-authorised card</b>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleAddCard} variant="outline">
              <div className="flex items-center justify-center gap-2">
                <HugeiconsIcon icon={PlusSignCircleIcon} className="w-6 h-6" />
              </div>
            </Button>
            <p>Add a Payment Card</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCards;
