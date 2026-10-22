import inquirer from 'inquirer';
import { AccountManager } from './AccountManager';
import { Account } from './Account';
import { Transaction } from './Transaction';
import { IAccount } from '../interfaces/IAccount';
import { TransactionType } from '../interfaces/TransactionType';
import { isValidDate } from '../utils/isValidDate';

export class ApplicationController {
  public accountManager = new AccountManager();

  async start(): Promise<void> {
    while (true) {
      console.clear();
      const { action } = await inquirer.prompt<{ action: string }>([{
        type: 'list',
        name: 'action',
        message: 'Счета',
        choices: [
          ...this.accountManager.getAccounts().map(account => ({
            name: account.toString(), value: account.id
          })),
          { name: 'Создать счёт', value: 'create' },
          { name: 'Выход', value: 'exit' }
        ]
      }]);
      if (action === 'exit') return;
      if (action === 'create') await this.createAccount();
      else {
        const account = this.accountManager.getAccountById(action);
        if (account) await this.watchAccount(account);
      }
    }
  }

  async createAccount(): Promise<void> {
    const { name } = await inquirer.prompt<{ name: string }>([{
      type: 'input', name: 'name', message: 'Название счёта:',
      filter: (value: string) => value.trim(),
      validate: (value: string) => value.length > 0 || 'Введите название.'
    }]);
    this.accountManager.addAccount(new Account(name));
  }

  async watchAccount(account: IAccount): Promise<void> {
    while (true) {
      console.clear();
      console.log(account.getSummaryString());
      console.log('\nТранзакции:');
      const transactions = account.getTransactions();
      if (transactions.length === 0) console.log('Транзакций пока нет.');
      transactions.forEach((transaction, index) => {
        console.log(`${index + 1}. ${transaction.toString()}`);
      });
      const { action } = await inquirer.prompt<{ action: string }>([{
        type: 'list', name: 'action', message: 'Действие:',
        choices: [
          { name: 'Добавить транзакцию', value: 'add' },
          { name: 'Удалить транзакцию', value: 'removeTransaction' },
          { name: 'Экспортировать в CSV', value: 'export' },
          { name: 'Удалить счёт', value: 'removeAccount' },
          { name: 'Назад к счетам', value: 'back' }
        ]
      }]);
      if (action === 'back') return;
      if (action === 'add') await this.addTransaction(account);
      if (action === 'removeTransaction') await this.removeTransaction(account);
      if (action === 'export') await this.exportTransactionsToCSV(account);
      if (action === 'removeAccount' && await this.removeAccount(account)) return;
    }
  }

  async addTransaction(account: IAccount): Promise<void> {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const answers = await inquirer.prompt<{
      amount: string; type: TransactionType; date: string; description: string;
    }>([
      {
        type: 'input', name: 'amount', message: 'Сумма:',
        validate: (value: string) =>
          (Number.isFinite(Number(value)) && Number(value) > 0) || 'Введите число больше нуля.'
      },
      {
        type: 'list', name: 'type', message: 'Тип:',
        choices: [{ name: 'Доход', value: 'income' }, { name: 'Расход', value: 'expense' }]
      },
      {
        type: 'input', name: 'date', message: 'Дата (YYYY-MM-DD):', default: today,
        validate: (value: string) => isValidDate(value) || 'Введите существующую дату в формате YYYY-MM-DD.'
      },
      { type: 'input', name: 'description', message: 'Описание:' }
    ]);
    account.addTransaction(new Transaction(
      Number(answers.amount), answers.type, answers.date, answers.description
    ));
  }

  async removeTransaction(account: IAccount): Promise<void> {
    const transactions = account.getTransactions();
    if (transactions.length === 0) {
      console.log('Нет транзакций для удаления.');
      await this.pause();
      return;
    }
    const { id } = await inquirer.prompt<{ id: string }>([{
      type: 'list', name: 'id', message: 'Выберите транзакцию:',
      choices: [
        ...transactions.map(transaction => ({ name: transaction.toString(), value: transaction.id })),
        { name: 'Назад', value: 'back' }
      ]
    }]);
    if (id === 'back') return;
    const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([{
      type: 'confirm', name: 'confirmed', message: 'Удалить транзакцию?', default: false
    }]);
    if (confirmed) account.removeTransactionById(id);
  }

  async removeAccount(account: IAccount): Promise<boolean> {
    const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([{
      type: 'confirm', name: 'confirmed',
      message: `Удалить счёт «${account.name}» и все его транзакции?`, default: false
    }]);
    if (!confirmed) return false;
    return this.accountManager.removeAccountById(account.id);
  }

  async exportTransactionsToCSV(account: IAccount): Promise<void> {
    const { filename } = await inquirer.prompt<{ filename: string }>([{
      type: 'input', name: 'filename', message: 'Имя файла без расширения:',
      filter: (value: string) => value.trim(),
      validate: (value: string) => {
        if (!value || /[<>:"/\\|?*\x00-\x1F]/.test(value) || /[. ]$/.test(value)) {
          return 'Введите корректное имя файла без пути.';
        }
        if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])($|\.)/i.test(value)) {
          return 'Это имя зарезервировано системой.';
        }
        return !value.toLowerCase().endsWith('.csv') || 'Введите имя без расширения .csv.';
      }
    }]);
    try {
      await account.exportTransactionsToCSV(`${filename}.csv`);
      console.log(`Транзакции экспортированы в ${filename}.csv`);
    } catch (error) {
      console.log(`Ошибка экспорта: ${error instanceof Error ? error.message : String(error)}`);
    }
    await this.pause();
  }

  private async pause(): Promise<void> {
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Нажмите Enter, чтобы продолжить.' }]);
  }
}
