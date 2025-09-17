import React from "react";
import Card from "../../components/Card";

export interface ContactDetailCardProps {
  contactName: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  onEdit?: () => void;
  className?: string;
}

const ContactDetailCard: React.FC<ContactDetailCardProps> = ({
  contactName,
  contactPhone,
  contactEmail,
  onEdit,
  className = "",
}) => {
  return (
    <Card
      className={className}
      editable={!!onEdit}
      onEdit={onEdit}
      title="Contact details"
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold text-gray-500">
          {contactName || "—"}
        </p>
        <p className="text-xs text-gray-500">{contactPhone || "—"}</p>
        <p className="text-xs text-gray-500">{contactEmail || "—"}</p>
        
      </div>
    </Card>
  );
};

export default ContactDetailCard;
