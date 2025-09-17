import React from "react";
import Card from "../../components/Card";

export interface AccountInfoCardProps {
  contactName: string;
  accountId: string;
  accountType: string;
  onEdit?: () => void;
  className?: string;
}

const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  contactName,
  accountId,
  accountType,
  onEdit,
  className = "",
}) => {
  return (
    <Card className={className} editable={!!onEdit} onEdit={onEdit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-primary font-bold text-sm">Account Name</p>
          <p className="text-xs text-gray-500">{contactName || "—"}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-primary font-bold text-sm">Account ID</p>
          <p className="text-xs text-gray-500">{accountId || "—"}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-primary font-bold text-sm">Account Type</p>
          <p className="text-xs text-gray-500">{accountType || "—"}</p>
        </div>
        
      </div>
    </Card>
  );
};

export default AccountInfoCard;
