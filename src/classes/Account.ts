import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { IAccount } from '../interfaces/IAccount';
import { ITransaction } from '../interfaces/ITransaction';
import { ISummary } from '../interfaces/ISummary';
import { escapeCsvValue } from '../utils/escapeCsvValue';

export class Account implements IAccount {
  readonly id = randomUUID();
  private transactions: ITransaction[] = [];
  public name: string;

  constructor(name: string) {
    this.name = name.trim();
    if (!this.name) throw new Error('Название счёта не может быть пустым.');
  }

  addTransaction(transaction: ITransaction): void {
    this.transactions.push(transaction);
  }

  removeTransactionById(id: string): boolean {
    const index = this.transactions.findIndex(transaction => transaction.id === id);
    if (index === -1) return false;
    this.transactions.splice(index, 1);
    return true;
  }

  getTransactions(): ITransaction[] {
    return [...this.transactions];
  }

  getSummary(): ISummary {
    let income = 0;
    let expenses = 0;
    for (const transaction of this.transactions) {
      if (transaction.type === 'income') income += transaction.amount;
      else expenses += transaction.amount;
    }
    return { income, expenses, balance: income - expenses, transactionsTotal: this.transactions.length };
  }

  getSummaryString(): string {
    const summary = this.getSummary();
    return `${this.name}\nДоходы: ${summary.income.toFixed(2)}\nРасходы: ${summary.expenses.toFixed(2)}\nБаланс: ${summary.balance.toFixed(2)}\nТранзакций: ${summary.transactionsTotal}`;
  }

  toString(): string {
    return `${this.name} — баланс: ${this.getSummary().balance.toFixed(2)}`;
  }

  async exportTransactionsToCSV(filename: string): Promise<void> {
    const rows = ['id,amount,type,date,description'];
    for (const transaction of this.transactions) {
      rows.push([
        transaction.id, transaction.amount, transaction.type,
        transaction.date, transaction.description
      ].map(escapeCsvValue).join(','));
    }
    await writeFile(filename, '\uFEFF' + rows.join('\r\n') + '\r\n', 'utf8');
  }
}
