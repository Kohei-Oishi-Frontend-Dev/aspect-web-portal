import React from "react";
import Card from "../../components/Card";

export interface AccountAddressCardProps {
  addressLine?: string | null;
  addressCity?: string | null;
  addressCounty?: string | null;
  addressPostcode?: string | null;
  onEdit?: () => void;
  className?: string;
}

const AccountAddressCard: React.FC<AccountAddressCardProps> = ({
  addressLine,
  addressCity,
  addressCounty,
  addressPostcode,
  onEdit,
  className = "",
}) => {
  const lines = [addressCity, addressCounty, addressPostcode].filter(Boolean);
  return (
    <Card
      className={className}
      editable={!!onEdit}
      onEdit={onEdit}
      title="Account address"
    >
      <div className="flex flex-row gap-1">
        <div>
          <p className="text-sm text-gray-500" >
            {addressLine || "—"}
          </p>
          {lines.map((line, i) => (
            <p
              key={i}
              className="text-sm text-gray-500"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AccountAddressCard;
