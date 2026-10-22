import { ITransaction } from './ITransaction';
import { ISummary } from './ISummary';

export interface IAccount {
  readonly id: string;
  name: string;
  addTransaction(transaction: ITransaction): void;
  removeTransactionById(id: string): boolean;
  getTransactions(): ITransaction[];
  getSummary(): ISummary;
  getSummaryString(): string;
  exportTransactionsToCSV(filename: string): Promise<void>;
  toString(): string;
}
