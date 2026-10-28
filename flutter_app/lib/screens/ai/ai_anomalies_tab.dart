import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../providers/ai_provider.dart';
import '../../providers/currency_provider.dart';
import '../../widgets/empty_state_view.dart';

class AIAnomaliesTab extends StatelessWidget {
  const AIAnomaliesTab({super.key});

  @override
  Widget build(BuildContext context) {
    final aiProvider = context.watch<AIProvider>();
    final currency = context.watch<CurrencyProvider>();
    final summary = aiProvider.summary;

    final anomalies = summary?.anomalies ?? [];
    final subscriptions = summary?.subscriptions ?? [];

    return RefreshIndicator(
      onRefresh: () => aiProvider.fetchIntelligenceData(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1. Detected Anomalies Section
          Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 22),
              const SizedBox(width: 8),
              Text('Unusual Transactions (${anomalies.length})', style: AppTypography.heading3()),
            ],
          ),
          const SizedBox(height: 8),
          if (anomalies.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline, color: AppColors.income, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'No unusual spending spikes or outliers detected in your recent activity.',
                        style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ...anomalies.map((a) {
              final merchant = a['merchant']?.toString() ?? a['title']?.toString() ?? 'Merchant';
              final amt = (a['amount'] as num?)?.toDouble() ?? 0.0;
              final reason = a['reason']?.toString() ?? 'Outlier transaction';

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x20EF4444),
                    child: Icon(Icons.priority_high, color: AppColors.expense, size: 20),
                  ),
                  title: Text(merchant, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text(reason, style: const TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                  trailing: Text(
                    currency.format(amt),
                    style: AppTypography.monoNumber(color: AppColors.expense, fontSize: 14),
                  ),
                ),
              );
            }),
          const SizedBox(height: 24),

          // 2. Active Subscription Drains
          Row(
            children: [
              const Icon(Icons.subscriptions_outlined, color: AppColors.primaryLight, size: 22),
              const SizedBox(width: 8),
              Text('Subscription Intelligence (${subscriptions.length})', style: AppTypography.heading3()),
            ],
          ),
          const SizedBox(height: 8),
          if (subscriptions.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Text(
                  'No recurring subscriptions identified yet.',
                  style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
                ),
              ),
            )
          else
            ...subscriptions.map((s) {
              final name = s['name']?.toString() ?? 'Subscription';
              final amt = (s['amount'] as num?)?.toDouble() ?? 0.0;
              final freq = s['frequency']?.toString() ?? 'monthly';
              final annualCost = (s['annualCost'] as num?)?.toDouble() ?? (amt * 12);

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x208B5CF6),
                    child: Icon(Icons.repeat, color: AppColors.secondary, size: 20),
                  ),
                  title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text('Annual Cost: ${currency.format(annualCost)}/yr', style: const TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                  trailing: Text(
                    '${currency.format(amt)}/$freq',
                    style: AppTypography.monoNumber(fontSize: 13),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}
