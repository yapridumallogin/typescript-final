import { randomUUID } from 'crypto';
import { ITransaction } from '../interfaces/ITransaction';
import { TransactionType } from '../interfaces/TransactionType';
import { isValidDate } from '../utils/isValidDate';

export class Transaction implements ITransaction {
  readonly id = randomUUID();

  constructor(
    public amount: number,
    public type: TransactionType,
    public date: string,
    public description: string
  ) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Сумма должна быть числом больше нуля.');
    }
    if (type !== 'income' && type !== 'expense') {
      throw new Error('Неизвестный тип транзакции.');
    }
    if (!isValidDate(date)) throw new Error('Некорректная дата.');
  }

  toString(): string {
    const type = this.type === 'income' ? 'Доход' : 'Расход';
    return `${this.date} | ${type}: ${this.amount.toFixed(2)} | ${this.description}`;
  }
}
