import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../providers/currency_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../repositories/report_repository.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final ReportRepository _reportRepo = ReportRepository();
  FinancialReportData? _reportData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReport();
  }

  Future<void> _loadReport() async {
    setState(() => _isLoading = true);
    try {
      final data = await _reportRepo.generateReport();
      if (mounted) {
        setState(() {
          _reportData = data;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleExportCsv() {
    final txs = context.read<TransactionProvider>().allTransactions;
    final csvContent = _reportRepo.exportLedgerToCsv(txs);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Export Ledger CSV'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Generated ${txs.length} transaction records in CSV format:'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.darkBackground,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  csvContent.split('\n').take(8).join('\n') + (csvContent.split('\n').length > 8 ? '\n...' : ''),
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 10),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Done')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currency = context.watch<CurrencyProvider>();

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Financial Reports')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final data = _reportData;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial Reports'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            tooltip: 'Export CSV Ledger',
            onPressed: _handleExportCsv,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadReport,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // YTD Overview
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF1E293B), Color(0xFF0F172A)]),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.darkBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Year-to-Date (YTD) Summary', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('YTD Inflows', style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(currency.format(data?.totalIncomeYTD ?? 0), style: AppTypography.monoNumber(color: AppColors.income, fontSize: 15)),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('YTD Outflows', style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(currency.format(data?.totalExpensesYTD ?? 0), style: AppTypography.monoNumber(color: AppColors.expense, fontSize: 15)),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Savings Rate', style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text('${(data?.savingsRateYTD ?? 0).toStringAsFixed(1)}%', style: AppTypography.monoNumber(color: AppColors.primaryLight, fontSize: 15)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 6-Month Cashflow Trends
            Text('6-Month Cash Flow Trend', style: AppTypography.heading3()),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: (data?.monthlyTrends ?? []).map((m) {
                    final monthName = m['month']?.toString() ?? '';
                    final inc = (m['income'] as num?)?.toDouble() ?? 0.0;
                    final exp = (m['expenses'] as num?)?.toDouble() ?? 0.0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6.0),
                      child: Row(
                        children: [
                          SizedBox(width: 40, child: Text(monthName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.income, shape: BoxShape.circle)),
                                    const SizedBox(width: 4),
                                    Text('In: ${currency.format(inc)}', style: const TextStyle(fontSize: 11)),
                                    const Spacer(),
                                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.expense, shape: BoxShape.circle)),
                                    const SizedBox(width: 4),
                                    Text('Out: ${currency.format(exp)}', style: const TextStyle(fontSize: 11)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Category Breakdown
            Text('Spending by Category', style: AppTypography.heading3()),
            const SizedBox(height: 8),
            Card(
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: (data?.categoryBreakdown ?? []).length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (ctx, i) {
                  final cat = data!.categoryBreakdown[i];
                  final name = cat['name']?.toString() ?? 'Other';
                  final amt = (cat['amount'] as num?)?.toDouble() ?? 0.0;
                  final pct = (cat['percent'] as num?)?.toDouble() ?? 0.0;
                  final color = AppColors.getCategoryColor(name);

                  return ListTile(
                    leading: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                    ),
                    title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: Text('${pct.toStringAsFixed(1)}% of expenses', style: const TextStyle(fontSize: 11, color: AppColors.textDarkSecondary)),
                    trailing: Text(currency.format(amt), style: AppTypography.monoNumber(fontSize: 14)),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
