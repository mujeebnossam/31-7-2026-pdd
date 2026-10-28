import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../providers/account_provider.dart';
import '../providers/ai_provider.dart';
import '../providers/bill_provider.dart';
import '../providers/budget_provider.dart';
import '../providers/goal_provider.dart';
import '../providers/transaction_provider.dart';
import 'ai/ai_hub_screen.dart';
import 'budgets/budgets_screen.dart';
import 'dashboard/dashboard_screen.dart';
import 'goals/goals_screen.dart';
import 'settings/settings_screen.dart';
import 'transactions/transactions_screen.dart';
import 'accounts/accounts_screen.dart';
import 'bills/bills_screen.dart';
import 'reports/reports_screen.dart';
import 'investments/investments_screen.dart';
import 'ingestion/csv_import_screen.dart';
import 'ingestion/demo_ingestion_screen.dart';

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _refreshAllData();
  }

  Future<void> _refreshAllData() async {
    context.read<AccountProvider>().fetchAccounts();
    context.read<TransactionProvider>().fetchTransactions();
    context.read<BudgetProvider>().fetchBudgets();
    context.read<GoalProvider>().fetchGoals();
    context.read<BillProvider>().fetchBills();
    context.read<AIProvider>().fetchIntelligenceData();
  }

  void _openMoreMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardTheme.color,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (_, scrollController) => ListView(
          controller: scrollController,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.darkBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'SpendWise Modules',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildMoreTile(
              icon: Icons.account_balance_outlined,
              color: AppColors.primary,
              title: 'Connected Accounts',
              subtitle: 'Manage checking, savings, credit & cash vaults',
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountsScreen()));
              },
            ),
            _buildMoreTile(
              icon: Icons.calendar_month_outlined,
              color: AppColors.warning,
              title: 'Bills & Subscriptions',
              subtitle: 'Track due dates, schedules and recurring outflows',
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const BillsScreen()));
              },
            ),
            _buildMoreTile(
              icon: Icons.flag_outlined,
              color: AppColors.income,
              title: 'Financial Goals',
              subtitle: 'Milestone tracking and savings reserves',
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const GoalsScreen()));
              },
            ),
            _buildMoreTile(
              icon: Icons.insert_chart_outlined,
              color: AppColors.info,
              title: 'Financial Reports',
              subtitle: 'Monthly cashflow trends & CSV ledger export',
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportsScreen()));
              },
            ),
            _buildMoreTile(
              icon: Icons.file_upload_outlined,
              color: const Color(0xFF10B981),
              title: 'CSV Statement Importer',
              subtitle: 'Parse bank exports with duplicate detection',
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const CsvImportScreen()));
              },
            ),
            _buildMoreTile(
              icon: Icons.bolt_outlined,
              color: const Color(0xFFF59E0B),
              title: 'UPI / Demo Ingestion Simulator',
              subtitle: 'Live automated pipeline simulation',
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const DemoIngestionScreen()));
              },
            ),
            _buildMoreTile(
              icon: Icons.show_chart_outlined,
              color: const Color(0xFF84CC16),
              title: 'Investment Simulator',
              subtitle: 'Sandboxed asset allocation sandbox',
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const InvestmentsScreen()));
              },
            ),
            _buildMoreTile(
              icon: Icons.settings_outlined,
              color: AppColors.textDarkSecondary,
              title: 'Settings & Security',
              subtitle: 'Currency preference, API Base URL and session',
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMoreTile({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: color, size: 22),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(color: AppColors.textDarkSecondary, fontSize: 12)),
      trailing: const Icon(Icons.chevron_right, size: 18, color: AppColors.textDarkSecondary),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      DashboardScreen(onOpenMore: () => _openMoreMenu(context)),
      const TransactionsScreen(),
      const BudgetsScreen(),
      const AIHubScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          if (index == 4) {
            _openMoreMenu(context);
          } else {
            setState(() => _currentIndex = index);
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            activeIcon: Icon(Icons.receipt_long),
            label: 'Ledger',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.pie_chart_outline),
            activeIcon: Icon(Icons.pie_chart),
            label: 'Budgets',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.auto_awesome_outlined),
            activeIcon: Icon(Icons.auto_awesome),
            label: 'AI Hub',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_outlined),
            activeIcon: Icon(Icons.grid_view),
            label: 'More',
          ),
        ],
      ),
    );
  }
}
