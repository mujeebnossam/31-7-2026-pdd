import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_typography.dart';
import '../core/utils/date_formatter.dart';
import '../models/goal_model.dart';
import '../providers/currency_provider.dart';

class GoalCard extends StatelessWidget {
  final GoalModel goal;
  final VoidCallback? onContribute;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const GoalCard({
    super.key,
    required this.goal,
    this.onContribute,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final currency = context.watch<CurrencyProvider>();
    final formattedCurrent = currency.format(goal.current);
    final formattedTarget = currency.format(goal.target);
    final percentInt = (goal.progress * 100).toInt();

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
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.income.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(goal.icon.isNotEmpty ? goal.icon : '🎯', style: const TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        goal.name,
                        style: AppTypography.bodyMedium(fontWeight: FontWeight.w700),
                      ),
                      if (goal.deadline != null && goal.deadline!.isNotEmpty)
                        Text(
                          'Target: ${DateFormatter.formatDisplay(goal.deadline)}',
                          style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
                        ),
                    ],
                  ),
                ),
                if (goal.isCompleted)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.income.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('COMPLETED', style: TextStyle(color: AppColors.income, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onSelected: (val) {
                    if (val == 'contribute') onContribute?.call();
                    if (val == 'edit') onEdit?.call();
                    if (val == 'delete') onDelete?.call();
                  },
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(value: 'contribute', child: Text('Deposit / Withdraw')),
                    const PopupMenuItem(value: 'edit', child: Text('Edit Goal')),
                    const PopupMenuItem(value: 'delete', child: Text('Delete Goal', style: TextStyle(color: AppColors.expense))),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: goal.progress,
                backgroundColor: AppColors.darkBorder,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.income),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$formattedCurrent saved',
                  style: AppTypography.monoNumber(fontSize: 13, color: AppColors.income),
                ),
                Text(
                  '$percentInt% of $formattedTarget',
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
