import 'package:flutter_test/flutter_test.dart';
import 'package:spendwise_ai/core/utils/currency_formatter.dart';
import 'package:spendwise_ai/models/account_model.dart';
import 'package:spendwise_ai/models/ai_models.dart';
import 'package:spendwise_ai/models/bill_model.dart';
import 'package:spendwise_ai/models/budget_model.dart';
import 'package:spendwise_ai/models/goal_model.dart';
import 'package:spendwise_ai/models/ingestion_models.dart';
import 'package:spendwise_ai/models/transaction_model.dart';
import 'package:spendwise_ai/models/user_model.dart';

void main() {
  group('SpendWise Models Serialization Tests', () {
    test('UserModel and AuthResponse parse correctly', () {
      final json = {
        'token': 'jwt_mock_token_123',
        'user': {
          'id': 'u1',
          'name': 'Alex Smith',
          'email': 'alex@test.com',
          'financialScore': 780,
          'memberSince': '2026-01-01',
        }
      };

      final authRes = AuthResponse.fromJson(json);
      expect(authRes.token, 'jwt_mock_token_123');
      expect(authRes.user.name, 'Alex Smith');
      expect(authRes.user.financialScore, 780);
    });

    test('AccountModel parses numeric decimal and string balance safely', () {
      final jsonNum = {'id': 'a1', 'name': 'Main Checking', 'type': 'Checking', 'balance': 2450.50, 'bank': 'Chase', 'last4': '1234'};
      final acc1 = AccountModel.fromJson(jsonNum);
      expect(acc1.balance, 2450.50);

      final jsonStr = {'id': 'a2', 'name': 'Savings Vault', 'type': 'Savings', 'balance': '12000.75', 'bank': 'Wells Fargo', 'last4': '5678'};
      final acc2 = AccountModel.fromJson(jsonStr);
      expect(acc2.balance, 12000.75);
    });

    test('TransactionModel handles expense and income amounts', () {
      final expenseJson = {
        'id': 't1',
        'title': 'Uber Downtown',
        'merchant': 'Uber',
        'amount': '24.50',
        'type': 'expense',
        'category': 'Transportation',
        'date': '2026-08-20',
      };
      final tx1 = TransactionModel.fromJson(expenseJson);
      expect(tx1.amount, 24.50);
      expect(tx1.isExpense, true);

      final incomeJson = {
        'id': 't2',
        'title': 'Salary Payroll',
        'merchant': 'Company',
        'amount': 3200.0,
        'type': 'income',
        'category': 'Salary',
        'date': '2026-08-21',
      };
      final tx2 = TransactionModel.fromJson(incomeJson);
      expect(tx2.amount, 3200.0);
      expect(tx2.isExpense, false);
    });

    test('BudgetModel calculates utilization and overbudget correctly', () {
      final normalBudget = BudgetModel.fromJson({'id': 'b1', 'category': 'Dining', 'budgeted': 500, 'spent': 250});
      expect(normalBudget.remaining, 250.0);
      expect(normalBudget.utilization, 0.5);
      expect(normalBudget.isOverBudget, false);

      final overBudget = BudgetModel.fromJson({'id': 'b2', 'category': 'Shopping', 'budgeted': 300, 'spent': 450});
      expect(overBudget.remaining, 0.0);
      expect(overBudget.isOverBudget, true);
    });

    test('GoalModel calculates progress and completion', () {
      final goal = GoalModel.fromJson({'id': 'g1', 'name': 'Trip', 'target': 1000, 'current': 600});
      expect(goal.progress, 0.6);
      expect(goal.remaining, 400.0);
      expect(goal.isCompleted, false);

      final compGoal = GoalModel.fromJson({'id': 'g2', 'name': 'Fund', 'target': 500, 'current': 500});
      expect(compGoal.isCompleted, true);
    });

    test('BillModel parses due status safely', () {
      final bill = BillModel.fromJson({
        'id': 'bl1',
        'name': 'Electric',
        'amount': 85.50,
        'dueDay': 15,
        'status': 'upcoming',
        'autopay': true,
      });
      expect(bill.amount, 85.50);
      expect(bill.autopay, true);
      expect(bill.isPaid, false);
    });

    test('AIChatResponse and InsightModel deserialization', () {
      final chatRes = AIChatResponse.fromJson({
        'response': 'You have saved \$450 this month.',
        'conversationId': 'conv_123',
        'messageId': 'msg_456',
      });
      expect(chatRes.response, contains('450'));
      expect(chatRes.conversationId, 'conv_123');

      final insight = AIInsightModel.fromJson({
        'id': 'ins1',
        'type': 'spending',
        'title': 'Dining Spikes',
        'description': 'Food spending increased by 15%',
        'severity': 'warning',
        'category': 'Food & Drink',
        'action': 'Set dining cap',
      });
      expect(insight.severity, 'warning');
      expect(insight.title, 'Dining Spikes');
    });

    test('CSVParseResultModel and BatchImportResultModel deserialization', () {
      final csvResult = CSVParseResultModel.fromJson({
        'totalRows': 10,
        'validCount': 9,
        'invalidCount': 1,
        'duplicateCount': 2,
        'totalIncome': 3000.0,
        'totalExpense': 150.0,
        'rows': [
          {
            'date': '2026-08-20',
            'amount': 15.0,
            'type': 'expense',
            'merchant': 'Store',
            'title': 'Store Item',
            'category': 'Shopping',
          }
        ],
      });
      expect(csvResult.totalRows, 10);
      expect(csvResult.validCount, 9);
      expect(csvResult.duplicateCount, 2);
      expect(csvResult.rows.length, 1);
    });
  });

  group('Currency Formatter Tests', () {
    test('Formats USD, INR, EUR correctly', () {
      final usd = CurrencyFormatter.format(100.0, currency: CurrencyType.usd);
      expect(usd, contains('100.00'));

      final inr = CurrencyFormatter.format(100.0, currency: CurrencyType.inr);
      expect(inr, contains('8,300'));

      final eur = CurrencyFormatter.format(100.0, currency: CurrencyType.eur);
      expect(eur, contains('92.00'));
    });
  });
}
