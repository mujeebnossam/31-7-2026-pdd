import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../providers/ai_provider.dart';
import '../../widgets/ai_insight_card.dart';
import '../../widgets/empty_state_view.dart';

class AIInsightsTab extends StatelessWidget {
  const AIInsightsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final aiProvider = context.watch<AIProvider>();
    final insights = aiProvider.insights;

    if (aiProvider.isLoadingIntelligence && insights.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (insights.isEmpty) {
      return EmptyStateView(
        title: 'No Insights Available',
        description: 'Log a few daily transactions to trigger our multi-tier AI analysis engine.',
        icon: Icons.lightbulb_outline,
        actionButtonText: 'Refresh Intelligence',
        onAction: () => aiProvider.fetchIntelligenceData(),
      );
    }

    return RefreshIndicator(
      onRefresh: () => aiProvider.fetchIntelligenceData(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                const Icon(Icons.psychology, color: AppColors.primaryLight, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'AI Insights Engine (${insights.length} active detections generated from verified PostgreSQL ledger)',
                    style: AppTypography.bodySmall(fontWeight: FontWeight.w600, color: AppColors.primaryLight),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ...insights.map((ins) => AIInsightCard(insight: ins)),
        ],
      ),
    );
  }
}
