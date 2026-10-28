import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../providers/ai_provider.dart';
import '../../providers/currency_provider.dart';
import '../../widgets/empty_state_view.dart';

class AIPredictionsTab extends StatelessWidget {
  const AIPredictionsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final aiProvider = context.watch<AIProvider>();
    final currency = context.watch<CurrencyProvider>();
    final preds = aiProvider.predictions;

    if (aiProvider.isLoadingIntelligence && preds == null) {
      return const Center(child: CircularProgressIndicator());
    }

    if (preds == null) {
      return EmptyStateView(
        title: 'Predictions Unavailable',
        description: 'Unable to load predictive models. Ensure you have recorded transactions.',
        icon: Icons.trending_up,
        actionButtonText: 'Refresh Models',
        onAction: () => aiProvider.fetchIntelligenceData(),
      );
    }

    return RefreshIndicator(
      onRefresh: () => aiProvider.fetchIntelligenceData(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Next Month Projection Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Next Month Forecast', style: AppTypography.heading3()),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${preds.confidence.toUpperCase()} CONFIDENCE',
                          style: const TextStyle(color: AppColors.primaryLight, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Predicted Inflow', style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              currency.format(preds.predictedIncome),
                              style: AppTypography.monoNumber(color: AppColors.income, fontSize: 15),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Predicted Outflow', style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              currency.format(preds.predictedExpenses),
                              style: AppTypography.monoNumber(color: AppColors.expense, fontSize: 15),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Net Projection', style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              currency.format(preds.predictedNet),
                              style: AppTypography.monoNumber(
                                color: preds.predictedNet >= 0 ? AppColors.income : AppColors.expense,
                                fontSize: 15,
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
          ),
          const SizedBox(height: 16),

          // 3-Month Trajectory
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.show_chart, color: AppColors.income, size: 20),
                      const SizedBox(width: 8),
                      Text('Financial Trajectory: ${preds.trajectoryTrend.toUpperCase()}', style: AppTypography.bodyMedium(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    preds.trajectoryReason,
                    style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Projected 3-Month Surplus: ${currency.format(preds.projected3MonthSavings)}',
                    style: AppTypography.monoNumber(color: AppColors.income, fontSize: 14),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Category Forecasts
          if (preds.categoryPredictions.isNotEmpty) ...[
            Text('Category Spending Forecasts', style: AppTypography.heading3()),
            const SizedBox(height: 8),
            ...preds.categoryPredictions.map((cp) {
              final cat = cp['category']?.toString() ?? 'Other';
              final amt = (cp['predictedAmount'] as num?)?.toDouble() ?? 0.0;
              final trend = cp['trend']?.toString() ?? 'stable';

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  title: Text(cat, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: Text('Trend: ${trend.toUpperCase()}', style: const TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                  trailing: Text(currency.format(amt), style: AppTypography.monoNumber(fontSize: 14)),
                ),
              );
            }),
          ],
        ],
      ),
    );
  }
}
