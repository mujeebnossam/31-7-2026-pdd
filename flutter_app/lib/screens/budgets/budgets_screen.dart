import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../models/budget_model.dart';
import '../../providers/budget_provider.dart';
import '../../providers/currency_provider.dart';
import '../../widgets/budget_card.dart';
import '../../widgets/empty_state_view.dart';
import 'budget_form_sheet.dart';

class BudgetsScreen extends StatelessWidget {
  const BudgetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final budgetProvider = context.watch<BudgetProvider>();
    final currency = context.watch<CurrencyProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Category Budgets'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const BudgetFormSheet(),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => budgetProvider.fetchBudgets(),
        child: budgetProvider.isLoading && budgetProvider.budgets.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : budgetProvider.budgets.isEmpty
                ? EmptyStateView(
                    title: 'No Budgets Configured',
                    description: 'Set spending limits for categories to receive proactive AI alerts.',
                    icon: Icons.pie_chart_outline,
                    actionButtonText: 'Create Budget',
                    onAction: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) => const BudgetFormSheet(),
                      );
                    },
                  )
                : ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      // Budget Overview Banner
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Total Budgeted', style: TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                                    const SizedBox(height: 2),
                                    Text(
                                      currency.format(budgetProvider.totalBudgeted),
                                      style: AppTypography.heading3(),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text('Total Spent', style: TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                                    const SizedBox(height: 2),
                                    Text(
                                      currency.format(budgetProvider.totalSpent),
                                      style: AppTypography.heading3(color: AppColors.warning),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...budgetProvider.budgets.map((b) {
                        return BudgetCard(
                          budget: b,
                          onEdit: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              builder: (_) => BudgetFormSheet(budgetToEdit: b),
                            );
                          },
                          onDelete: () => budgetProvider.deleteBudget(b.id),
                        );
                      }),
                    ],
                  ),
      ),
    );
  }
}
