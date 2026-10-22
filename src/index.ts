import { ApplicationController } from './classes/ApplicationController';
import { Account } from './classes/Account';
import { Transaction } from './classes/Transaction';

function setInitialState(controller: ApplicationController): void {
  const personal = new Account('Личный бюджет');
  personal.addTransaction(new Transaction(1000, 'income', '2023-01-01', 'Зарплата'));
  personal.addTransaction(new Transaction(200, 'expense', '2023-01-05', 'Продукты'));
  personal.addTransaction(new Transaction(150, 'expense', '2023-01-09', 'Коммунальные услуги'));
  controller.accountManager.addAccount(personal);

  const vacation = new Account('Копилка на отпуск');
  vacation.addTransaction(new Transaction(500, 'income', '2023-04-01', 'Премия'));
  vacation.addTransaction(new Transaction(600, 'income', '2023-01-01', 'Возврат долга'));
  vacation.addTransaction(new Transaction(300, 'expense', '2023-01-05', 'Билеты на самолёт'));
  vacation.addTransaction(new Transaction(200, 'expense', '2023-01-09', 'Номер в отеле'));
  controller.accountManager.addAccount(vacation);
}

const controller = new ApplicationController();
setInitialState(controller);
controller.start().catch((error: unknown) => {
  console.error('Ошибка приложения:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
