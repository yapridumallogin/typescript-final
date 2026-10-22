import { IAccount } from '../interfaces/IAccount';
import { IAccountManager } from '../interfaces/IAccountManager';

export class AccountManager implements IAccountManager {
  private accounts: IAccount[] = [];

  addAccount(account: IAccount): void {
    this.accounts.push(account);
  }

  getAccountById(id: string): IAccount | undefined {
    return this.accounts.find(account => account.id === id);
  }

  removeAccountById(id: string): boolean {
    const index = this.accounts.findIndex(account => account.id === id);
    if (index === -1) return false;
    this.accounts.splice(index, 1);
    return true;
  }

  getAccounts(): IAccount[] {
    return [...this.accounts];
  }
}
