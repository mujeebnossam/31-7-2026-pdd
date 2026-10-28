import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../models/ingestion_models.dart';
import '../../providers/account_provider.dart';
import '../../providers/currency_provider.dart';
import '../../providers/ingestion_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/custom_button.dart';

class CsvImportScreen extends StatefulWidget {
  const CsvImportScreen({super.key});

  @override
  State<CsvImportScreen> createState() => _CsvImportScreenState();
}

class _CsvImportScreenState extends State<CsvImportScreen> {
  final _csvTextController = TextEditingController(
    text: '''Date,Description,Amount,Type
2026-08-15,Starbucks Coffee,5.40,expense
2026-08-16,Uber Ride Downtown,24.50,expense
2026-08-17,Salary Direct Deposit,3500.00,income
2026-08-18,Whole Foods Market,82.30,expense
2026-08-19,Netflix Subscription,15.99,expense''',
  );

  String? _selectedAccountId;
  bool _skipDuplicates = true;

  @override
  void dispose() {
    _csvTextController.dispose();
    super.dispose();
  }

  Future<void> _handleParse() async {
    final ingProvider = context.read<IngestionProvider>();
    final success = await ingProvider.parseCsv(
      _csvTextController.text.trim(),
      accountId: _selectedAccountId,
    );

    if (!mounted) return;

    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ingProvider.errorMessage ?? 'Failed to parse CSV'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  Future<void> _handleConfirmImport() async {
    final ingProvider = context.read<IngestionProvider>();
    final accountProvider = context.read<AccountProvider>();

    final targetAccountId = _selectedAccountId ??
        (accountProvider.accounts.isNotEmpty ? accountProvider.accounts.first.id : '');

    if (targetAccountId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select or create an account first')),
      );
      return;
    }

    final success = await ingProvider.confirmImport(
      targetAccountId,
      skipDuplicates: _skipDuplicates,
    );

    if (!mounted) return;

    if (success) {
      // Refresh transactions and accounts
      context.read<TransactionProvider>().fetchTransactions();
      context.read<AccountProvider>().fetchAccounts();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Successfully imported ${ingProvider.importResult?.importedCount ?? 0} transactions!'),
          backgroundColor: AppColors.income,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ingProvider.errorMessage ?? 'Import failed'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ingProvider = context.watch<IngestionProvider>();
    final accountProvider = context.watch<AccountProvider>();
    final currency = context.watch<CurrencyProvider>();

    final parseResult = ingProvider.parseResult;
    final importResult = ingProvider.importResult;

    return Scaffold(
      appBar: AppBar(
        title: const Text('CSV Statement Importer'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Step 1: Source & Account Selector
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('1. Select Target Account', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  if (accountProvider.accounts.isEmpty)
                    const Text('No accounts connected. Create an account first.', style: TextStyle(color: AppColors.expense))
                  else
                    DropdownButtonFormField<String>(
                      value: _selectedAccountId ?? accountProvider.accounts.first.id,
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10)),
                      items: accountProvider.accounts.map((a) {
                        return DropdownMenuItem(value: a.id, child: Text('${a.name} (${a.bank})'));
                      }).toList(),
                      onChanged: (v) => setState(() => _selectedAccountId = v),
                    ),
                  const SizedBox(height: 16),

                  const Text('2. Paste or Load CSV Text', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _csvTextController,
                    maxLines: 6,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                    decoration: const InputDecoration(
                      hintText: 'Date,Merchant,Amount,Type\n2026-08-01,Groceries,45.00,expense',
                    ),
                  ),
                  const SizedBox(height: 12),
                  CustomButton(
                    text: 'Parse & Inspect Statement',
                    isLoading: ingProvider.isParsing,
                    onPressed: _handleParse,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Step 2: Parsed Preview
          if (parseResult != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Statement Inspection', style: AppTypography.heading3()),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.income.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text('${parseResult.validCount} Valid Rows', style: const TextStyle(color: AppColors.income, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total Inflow: ${currency.format(parseResult.totalIncome)}', style: const TextStyle(color: AppColors.income, fontSize: 12)),
                        Text('Total Outflow: ${currency.format(parseResult.totalExpense)}', style: const TextStyle(color: AppColors.expense, fontSize: 12)),
                      ],
                    ),
                    if (parseResult.duplicateCount > 0) ...[
                      const SizedBox(height: 8),
                      Text(
                        '⚠️ ${parseResult.duplicateCount} duplicate transaction(s) detected.',
                        style: const TextStyle(color: AppColors.warning, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                    const SizedBox(height: 12),
                    CheckboxListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Skip Detected Duplicates', style: TextStyle(fontSize: 13)),
                      value: _skipDuplicates,
                      onChanged: (v) => setState(() => _skipDuplicates = v ?? true),
                    ),
                    const SizedBox(height: 12),
                    CustomButton(
                      text: 'Confirm & Import to Ledger',
                      isLoading: ingProvider.isImporting,
                      onPressed: _handleConfirmImport,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Step 3: Success Confirmation
          if (importResult != null) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.income.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.income.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.check_circle, color: AppColors.income, size: 20),
                      SizedBox(width: 8),
                      Text('Batch Import Succeeded!', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.income)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Imported ${importResult.importedCount} transaction(s) into ${importResult.accountName}.'),
                  Text('Updated Account Balance: ${currency.format(importResult.accountBalanceAfter)}'),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
