import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../providers/account_provider.dart';
import '../../providers/ai_provider.dart';
import '../../providers/currency_provider.dart';
import '../../providers/ingestion_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/custom_button.dart';

class DemoIngestionScreen extends StatefulWidget {
  const DemoIngestionScreen({super.key});

  @override
  State<DemoIngestionScreen> createState() => _DemoIngestionScreenState();
}

class _DemoIngestionScreenState extends State<DemoIngestionScreen> {
  String _selectedMerchant = 'Swiggy Food Delivery';
  double _amount = 18.50;
  String _type = 'expense';

  final List<Map<String, dynamic>> _demoPresets = [
    {'name': 'Swiggy Food Delivery', 'amount': 18.50, 'type': 'expense'},
    {'name': 'Uber Transit City Ride', 'amount': 26.00, 'type': 'expense'},
    {'name': 'Salary Payroll Client Transfer', 'amount': 2800.00, 'type': 'income'},
    {'name': 'Whole Foods Groceries', 'amount': 64.20, 'type': 'expense'},
    {'name': 'Netflix Monthly Subscription', 'amount': 15.99, 'type': 'expense'},
  ];

  Future<void> _handleSimulate() async {
    final ingProvider = context.read<IngestionProvider>();
    final accountProvider = context.read<AccountProvider>();

    final targetAccountId = accountProvider.accounts.isNotEmpty ? accountProvider.accounts.first.id : null;

    final success = await ingProvider.simulateDemo(
      merchant: _selectedMerchant,
      amount: _amount,
      type: _type,
      accountId: targetAccountId,
      source: 'upi',
    );

    if (!mounted) return;

    if (success) {
      // Re-fetch transactions, accounts, and AI insights
      context.read<TransactionProvider>().fetchTransactions();
      context.read<AccountProvider>().fetchAccounts();
      context.read<AIProvider>().fetchIntelligenceData();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚡ Ingestion pipeline executed and synchronized!'),
          backgroundColor: AppColors.income,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ingProvider.errorMessage ?? 'Simulation failed'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ingProvider = context.watch<IngestionProvider>();
    final currency = context.watch<CurrencyProvider>();
    final demoResult = ingProvider.demoResult;

    return Scaffold(
      appBar: AppBar(
        title: const Text('UPI Ingestion Simulator'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF854D0E), Color(0xFF713F12)]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              children: [
                Icon(Icons.bolt, color: Colors.amber, size: 28),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Simulates automated UPI / SMS bank statement webhook triggers that ingest live into your ledger.',
                    style: TextStyle(color: Colors.white, fontSize: 12, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Preset Selection
          Text('Select Demo Transaction Payload', style: AppTypography.heading3()),
          const SizedBox(height: 8),
          ..._demoPresets.map((p) {
            final isSelected = _selectedMerchant == p['name'];
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(
                  color: isSelected ? AppColors.primary : AppColors.darkBorder,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: ListTile(
                onTap: () {
                  setState(() {
                    _selectedMerchant = p['name'];
                    _amount = p['amount'];
                    _type = p['type'];
                  });
                },
                title: Text(p['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: Text('Type: ${p['type'].toString().toUpperCase()}', style: const TextStyle(fontSize: 11, color: AppColors.textDarkSecondary)),
                trailing: Text(
                  currency.format(p['amount']),
                  style: AppTypography.monoNumber(
                    color: p['type'] == 'income' ? AppColors.income : AppColors.expense,
                    fontSize: 14,
                  ),
                ),
              ),
            );
          }),
          const SizedBox(height: 16),

          CustomButton(
            text: 'Trigger Automated Webhook',
            icon: Icons.bolt,
            backgroundColor: const Color(0xFFD97706),
            isLoading: ingProvider.isSimulatingDemo,
            onPressed: _handleSimulate,
          ),
          const SizedBox(height: 20),

          // Live Pipeline Execution Result
          if (demoResult != null) ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.darkSurface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.income.withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.check_circle, color: AppColors.income, size: 22),
                      SizedBox(width: 8),
                      Text('Pipeline Successfully Executed', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.income)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildPipelineStep('1. Normalized Merchant', demoResult.merchant),
                  _buildPipelineStep('2. Inferred Category', '${demoResult.category} (${(demoResult.confidence * 100).toInt()}% confidence)'),
                  _buildPipelineStep('3. Account Updated', '${demoResult.accountName} (${currency.format(demoResult.balanceBefore)} → ${currency.format(demoResult.balanceAfter)})'),
                  if (demoResult.aiInsightRecommendation.isNotEmpty)
                    _buildPipelineStep('4. AI Downstream Advice', demoResult.aiInsightRecommendation),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPipelineStep(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textDarkSecondary, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(desc, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
