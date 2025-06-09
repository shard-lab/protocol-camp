export type Address = string;

export interface Transaction {
  from: Address;
  to: Address;
  value: number;
}

export type TransactionReceipt = {
  status: number;
  reason?: string;
};
