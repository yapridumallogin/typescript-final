import { IAccount } from './IAccount';

export interface IAccountManager {
  addAccount(account: IAccount): void;
  getAccountById(id: string): IAccount | undefined;
  removeAccountById(id: string): boolean;
  getAccounts(): IAccount[];
}
