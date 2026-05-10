"use client";
import * as React from "react";
import { MemberHeader, type MemberStatus } from "./MemberHeader";
import { FinancialStatusCard } from "./FinancialStatusCard";
import { AccessControlCard } from "./AccessControlCard";
import { PaymentHistory, type PaymentTransaction } from "./PaymentHistory";

interface MemberDetailProps {
  member?: {
    id?: string;
    fullName?: string;
    email?: string;
    dni?: string;
    status?: MemberStatus;
    planName?: string;
    avatarUrl?: string;
    lastAccessAt?: string;
  };
  pendingPayment?: {
    amount?: number;
    overdueDays?: number;
  };
  transactions?: PaymentTransaction[];
  isAccessBlocked?: boolean;
  blockReason?: string;
  onEditProfile?: () => void;
  onCollectPayment?: () => void;
  onToggleAccess?: (blocked: boolean) => void;
}

export function MemberDetail({
  member,
  pendingPayment,
  transactions,
  isAccessBlocked,
  blockReason,
  onEditProfile,
  onCollectPayment,
  onToggleAccess,
}: MemberDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <MemberHeader
        id={member?.id}
        fullName={member?.fullName}
        email={member?.email}
        dni={member?.dni}
        planName={member?.planName}
        status={member?.status}
        avatarUrl={member?.avatarUrl}
        onEditProfile={onEditProfile}
      />

      <div className="flex gap-5 max-md:flex-col">
        <aside className="flex flex-col gap-4 flex-[shrink] w-[280px] max-md:w-full">
          <FinancialStatusCard
            pendingBalance={pendingPayment?.amount}
            overdueDays={pendingPayment?.overdueDays}
            onCollectPayment={onCollectPayment}
          />
          <AccessControlCard
            isBlocked={isAccessBlocked}
            blockReason={blockReason}
            onToggleAccess={onToggleAccess}
          />
        </aside>
        <PaymentHistory transactions={transactions} />
      </div>
    </div>
  );
}
