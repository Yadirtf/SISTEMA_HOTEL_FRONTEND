export type CashRegisterStatus = "open" | "closed" | "suspended";
export type TransactionType = "income" | "expense";
export type TransactionCategory = "sale" | "reservation_payment" | "refund" | "adjustment" | "withdrawal" | "deposit" | "other";
export type ReferenceType = "sale" | "reservation" | "refund" | "adjustment";

export type CashRegister = {
  _id: string;
  registerNumber: string;
  userId: number;
  initialAmount: number;
  currentBalance: number;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt?: string;
  openedBy: number;
  closedBy?: number;
  assignedBy: number; // Admin que asignó la caja
  notes?: string;
  closingNotes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CashTransaction = {
  _id: string;
  cashRegisterId: string | { _id: string; registerNumber: string; userId: number };
  transactionType: TransactionType;
  transactionCategory: TransactionCategory;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: ReferenceType;
  paymentMethodId?: string | { _id: string; name: string; icon?: string };
  userId: number;
  transactionDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CashRegisterAudit = {
  _id: string;
  cashRegisterId: string;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
  countedBy: number;
  countedAt: string;
  notes?: string;
  transactions: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CashRegisterFormData = {
  registerNumber: string;
  userId: number;
  initialAmount: number;
  notes?: string;
};

export type CashTransactionFormData = {
  cashRegisterId: string;
  transactionType: TransactionType;
  transactionCategory: TransactionCategory;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: ReferenceType;
  paymentMethodId?: string;
  notes?: string;
};

export type CloseCashRegisterFormData = {
  actualBalance: number;
  closingNotes?: string;
};

export type CashRegisterStats = {
  cashRegister: CashRegister;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  incomeByPaymentMethod: Record<string, number>;
  operationsReport?: {
    totalSales: number;
    totalSalesAmount: number;
    totalReservations: number;
    totalReservationsAmount: number;
    totalCashIncome: number;
    totalCardIncome: number;
    totalTransferIncome: number;
    totalCashExpense?: number; // Egresos en efectivo (cambios dados, retiros, etc.)
  };
};

export type TransactionStats = {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  incomeByPaymentMethod: Record<string, number>;
  totalCashIncome: number;
  totalTransferIncome: number;
};


