import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../models/goal_model.dart';
import '../../providers/currency_provider.dart';
import '../../providers/goal_provider.dart';
import '../../widgets/empty_state_view.dart';
import '../../widgets/goal_card.dart';
import 'goal_contribution_sheet.dart';
import 'goal_form_sheet.dart';

class GoalsScreen extends StatelessWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final goalProvider = context.watch<GoalProvider>();
    final currency = context.watch<CurrencyProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial Goals'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const GoalFormSheet(),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => goalProvider.fetchGoals(),
        child: goalProvider.isLoading && goalProvider.goals.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : goalProvider.goals.isEmpty
                ? EmptyStateView(
                    title: 'No Goals Configured',
                    description: 'Set target savings milestones for emergency funds, travel, or investments.',
                    icon: Icons.flag_outlined,
                    actionButtonText: 'Create Goal',
                    onAction: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) => const GoalFormSheet(),
                      );
                    },
                  )
                : ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      // Goal Summary Card
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.income.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.income.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Total Target', style: TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                                const SizedBox(height: 2),
                                Text(
                                  currency.format(goalProvider.totalTarget),
                                  style: AppTypography.heading3(),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text('Total Saved', style: TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                                const SizedBox(height: 2),
                                Text(
                                  currency.format(goalProvider.totalCurrent),
                                  style: AppTypography.heading3(color: AppColors.income),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...goalProvider.goals.map((g) {
                        return GoalCard(
                          goal: g,
                          onContribute: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              builder: (_) => GoalContributionSheet(goal: g),
                            );
                          },
                          onEdit: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              builder: (_) => GoalFormSheet(goalToEdit: g),
                            );
                          },
                          onDelete: () => goalProvider.deleteGoal(g.id),
                        );
                      }),
                    ],
                  ),
      ),
    );
  }
}
