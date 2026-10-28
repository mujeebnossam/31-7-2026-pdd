import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_typography.dart';
import '../models/ai_models.dart';

class AIInsightCard extends StatelessWidget {
  final AIInsightModel insight;
  final VoidCallback? onAction;

  const AIInsightCard({
    super.key,
    required this.insight,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    Color badgeColor;
    switch (insight.severity) {
      case 'danger':
        badgeColor = AppColors.expense;
        break;
      case 'warning':
        badgeColor = AppColors.warning;
        break;
      case 'success':
        badgeColor = AppColors.income;
        break;
      case 'info':
      default:
        badgeColor = AppColors.info;
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(insight.icon.isNotEmpty ? insight.icon : '🤖', style: const TextStyle(fontSize: 20)),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    insight.title,
                    style: AppTypography.bodyMedium(fontWeight: FontWeight.w700),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: badgeColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    insight.category.toUpperCase(),
                    style: TextStyle(color: badgeColor, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              insight.description,
              style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
            ),
            if (insight.supportingMetric != null && insight.supportingMetric!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.darkBackground,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  insight.supportingMetric!,
                  style: AppTypography.monoNumber(fontSize: 12, color: AppColors.primaryLight),
                ),
              ),
            ],
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primary.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lightbulb_outline, size: 16, color: AppColors.primaryLight),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      insight.action,
                      style: AppTypography.bodySmall(fontWeight: FontWeight.w600, color: AppColors.primaryLight),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
