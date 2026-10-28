import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_typography.dart';
import '../models/budget_model.dart';
import '../providers/currency_provider.dart';

class BudgetCard extends StatelessWidget {
  final BudgetModel budget;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const BudgetCard({
    super.key,
    required this.budget,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final currency = context.watch<CurrencyProvider>();
    final formattedSpent = currency.format(budget.spent);
    final formattedBudgeted = currency.format(budget.budgeted);
    final utilizationPercent = (budget.utilization * 100).toInt();

    final catColor = AppColors.getCategoryColor(budget.category);
    final progressColor = budget.isOverBudget
        ? AppColors.expense
        : (budget.utilization > 0.85 ? AppColors.warning : AppColors.primary);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: catColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(budget.icon.isNotEmpty ? budget.icon : '📊', style: const TextStyle(fontSize: 18)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        budget.category,
                        style: AppTypography.bodyMedium(fontWeight: FontWeight.w700),
                      ),
                      if (budget.isOverBudget)
                        const Text(
                          'Over budget!',
                          style: TextStyle(color: AppColors.expense, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onSelected: (val) {
                    if (val == 'edit') onEdit?.call();
                    if (val == 'delete') onDelete?.call();
                  },
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(value: 'edit', child: Text('Edit Budget')),
                    const PopupMenuItem(value: 'delete', child: Text('Delete Budget', style: TextStyle(color: AppColors.expense))),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: budget.utilization.clamp(0.0, 1.0),
                backgroundColor: AppColors.darkBorder,
                valueColor: AlwaysStoppedAnimation<Color>(progressColor),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$formattedSpent spent',
                  style: AppTypography.monoNumber(fontSize: 13, color: progressColor),
                ),
                Text(
                  '$utilizationPercent% of $formattedBudgeted',
                  style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
