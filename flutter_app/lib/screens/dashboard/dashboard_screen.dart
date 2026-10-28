import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../providers/account_provider.dart';
import '../../providers/ai_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bill_provider.dart';
import '../../providers/budget_provider.dart';
import '../../providers/currency_provider.dart';
import '../../providers/goal_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/account_card.dart';
import '../../widgets/ai_insight_card.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/transaction_tile.dart';
import '../accounts/account_form_sheet.dart';
import '../accounts/accounts_screen.dart';
import '../transactions/transaction_form_sheet.dart';
import '../transactions/transactions_screen.dart';
import '../ingestion/demo_ingestion_screen.dart';

class DashboardScreen extends StatelessWidget {
  final VoidCallback onOpenMore;

  const DashboardScreen({super.key, required this.onOpenMore});

  Future<void> _refreshData(BuildContext context) async {
    await Future.wait([
      context.read<AccountProvider>().fetchAccounts(),
      context.read<TransactionProvider>().fetchTransactions(),
      context.read<BudgetProvider>().fetchBudgets(),
      context.read<GoalProvider>().fetchGoals(),
      context.read<BillProvider>().fetchBills(),
      context.read<AIProvider>().fetchIntelligenceData(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final accounts = context.watch<AccountProvider>();
    final transactions = context.watch<TransactionProvider>();
    final budgets = context.watch<BudgetProvider>();
    final goals = context.watch<GoalProvider>();
    final bills = context.watch<BillProvider>();
    final ai = context.watch<AIProvider>();
    final currency = context.watch<CurrencyProvider>();

    final user = auth.currentUser;
    final healthScore = ai.summary?.financialHealthScore ?? user?.financialScore ?? 720;
    final healthGrade = ai.summary?.financialHealthGrade ?? 'Good';

    final totalNetWorth = accounts.totalBalance;
    final monthlyIncome = transactions.totalIncome;
    final monthlyExpenses = transactions.totalExpenses;
    final netCashFlow = transactions.netCashFlow;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppColors.primary, AppColors.secondary]),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: const Text('💎', style: TextStyle(fontSize: 18)),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SpendWise AI', style: AppTypography.heading3()),
                Text(
                  user != null ? 'Hello, ${user.name.split(' ')[0]}' : 'Live Intelligence Vault',
                  style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bolt_outlined, color: AppColors.warning),
            tooltip: 'Live Demo Simulator',
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const DemoIngestionScreen()));
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _refreshData(context),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _refreshData(context),
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // 1. Net Worth Hero Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E1B4B), Color(0xFF312E81)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.15),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Net Worth',
                        style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.healthScore.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.healthScore.withOpacity(0.5)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('⚡ Score ', style: TextStyle(color: Colors.white70, fontSize: 11)),
                            Text('$healthScore', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                            Text(' ($healthGrade)', style: const TextStyle(color: AppColors.income, fontSize: 10, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    currency.format(totalNetWorth),
                    style: AppTypography.heading1(color: Colors.white),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Inflows (Income)', style: TextStyle(color: Colors.white60, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              currency.format(monthlyIncome),
                              style: AppTypography.monoNumber(fontSize: 14, color: AppColors.income),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Outflows (Spend)', style: TextStyle(color: Colors.white60, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              currency.format(monthlyExpenses),
                              style: AppTypography.monoNumber(fontSize: 14, color: AppColors.expense),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Net Cash Flow', style: TextStyle(color: Colors.white60, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              currency.format(netCashFlow),
                              style: AppTypography.monoNumber(
                                fontSize: 14,
                                color: netCashFlow >= 0 ? AppColors.income : AppColors.expense,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 2. Quick Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) => const TransactionFormSheet(),
                      );
                    },
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Add Tx'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) => const AccountFormSheet(),
                      );
                    },
                    icon: const Icon(Icons.account_balance, size: 18),
                    label: const Text('+ Account'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // 3. Connected Accounts Carousel
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Connected Accounts', style: AppTypography.heading3()),
                TextButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountsScreen()));
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (accounts.isLoading && accounts.accounts.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
            else if (accounts.accounts.isEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      const Text('No accounts connected yet.', style: TextStyle(color: AppColors.textDarkSecondary)),
                      const SizedBox(height: 10),
                      ElevatedButton(
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            builder: (_) => const AccountFormSheet(),
                          );
                        },
                        child: const Text('Create First Account'),
                      ),
                    ],
                  ),
                ),
              )
            else
              SizedBox(
                height: 150,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: accounts.accounts.length,
                  itemBuilder: (ctx, i) {
                    final acc = accounts.accounts[i];
                    return AccountCard(
                      account: acc,
                      onEdit: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          builder: (_) => AccountFormSheet(accountToEdit: acc),
                        );
                      },
                      onDelete: () => accounts.deleteAccount(acc.id),
                    );
                  },
                ),
              ),
            const SizedBox(height: 24),

            // 4. AI Insight Highlights
            if (ai.insights.isNotEmpty) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Text('🤖 ', style: TextStyle(fontSize: 18)),
                      Text('AI Insights', style: AppTypography.heading3()),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('LIVE ENGINE', style: TextStyle(color: AppColors.primaryLight, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...ai.insights.take(2).map((ins) => AIInsightCard(insight: ins)),
              const SizedBox(height: 16),
            ],

            // 5. Recent Transactions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Activity', style: AppTypography.heading3()),
                TextButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const TransactionsScreen()));
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (transactions.isLoading && transactions.allTransactions.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
            else if (transactions.allTransactions.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: Center(
                    child: Text('No transactions recorded yet.', style: TextStyle(color: AppColors.textDarkSecondary)),
                  ),
                ),
              )
            else
              Card(
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: transactions.allTransactions.take(5).length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (ctx, i) {
                    final tx = transactions.allTransactions[i];
                    return TransactionTile(
                      transaction: tx,
                      onDelete: () => transactions.deleteTransaction(tx.id),
                    );
                  },
                ),
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
