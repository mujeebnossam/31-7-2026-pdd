import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../models/bill_model.dart';
import '../../providers/account_provider.dart';
import '../../providers/bill_provider.dart';
import '../../providers/currency_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/custom_button.dart';

class PayBillSheet extends StatefulWidget {
  final BillModel bill;

  const PayBillSheet({super.key, required this.bill});

  @override
  State<PayBillSheet> createState() => _PayBillSheetState();
}

class _PayBillSheetState extends State<PayBillSheet> {
  String? _selectedAccountId;
  bool _isLoading = false;

  Future<void> _handleConfirmPayment() async {
    setState(() => _isLoading = true);
    final billProvider = context.read<BillProvider>();

    final result = await billProvider.payBill(
      widget.bill.id,
      accountId: _selectedAccountId,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result != null) {
      // Re-sync accounts and transactions ledgers
      context.read<AccountProvider>().fetchAccounts();
      context.read<TransactionProvider>().fetchTransactions();
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          backgroundColor: AppColors.income,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(billProvider.errorMessage ?? 'Payment processing failed'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currency = context.watch<CurrencyProvider>();
    final accounts = context.watch<AccountProvider>().accounts;

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Settle Bill Payment',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Text(widget.bill.name, style: AppTypography.heading3()),
                const SizedBox(height: 4),
                Text(
                  currency.format(widget.bill.amount),
                  style: AppTypography.heading1(color: AppColors.primaryLight),
                ),
                const SizedBox(height: 4),
                Text('Frequency: ${widget.bill.frequency.toUpperCase()}', style: const TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (accounts.isNotEmpty) ...[
            const Text('Deduct From Account', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _selectedAccountId,
              hint: const Text('Select Account (Optional)'),
              decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
              items: accounts.map((a) {
                return DropdownMenuItem(value: a.id, child: Text('${a.name} (\$${a.balance.toStringAsFixed(2)})'));
              }).toList(),
              onChanged: (v) => setState(() => _selectedAccountId = v),
            ),
            const SizedBox(height: 12),
          ],
          const Text(
            'Confirming will advance next recurring due date and record a transaction in your ledger.',
            style: TextStyle(fontSize: 12, color: AppColors.textDarkSecondary),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Confirm & Mark as Paid',
            isLoading: _isLoading,
            onPressed: _handleConfirmPayment,
          ),
        ],
      ),
    );
  }
}
