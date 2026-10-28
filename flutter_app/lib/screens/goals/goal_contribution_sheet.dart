import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/goal_model.dart';
import '../../providers/account_provider.dart';
import '../../providers/goal_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class GoalContributionSheet extends StatefulWidget {
  final GoalModel goal;

  const GoalContributionSheet({super.key, required this.goal});

  @override
  State<GoalContributionSheet> createState() => _GoalContributionSheetState();
}

class _GoalContributionSheetState extends State<GoalContributionSheet> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  String _type = 'deposit'; // 'deposit' | 'withdrawal'
  String? _selectedAccountId;
  bool _isLoading = false;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final goalProvider = context.read<GoalProvider>();
    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;

    final result = await goalProvider.contribute(
      widget.goal.id,
      amount,
      type: _type,
      accountId: _selectedAccountId,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result != null) {
      // Refresh accounts to reflect updated balance
      context.read<AccountProvider>().fetchAccounts();
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
          content: Text(goalProvider.errorMessage ?? 'Transaction failed'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final accounts = context.watch<AccountProvider>().accounts;

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Manage: ${widget.goal.name}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'deposit', label: Text('Deposit Funds'), icon: Icon(Icons.add, size: 16)),
                ButtonSegment(value: 'withdrawal', label: Text('Withdraw Funds'), icon: Icon(Icons.remove, size: 16)),
              ],
              selected: {_type},
              onSelectionChanged: (set) => setState(() => _type = set.first),
            ),
            const SizedBox(height: 16),
            CustomTextField(
              controller: _amountController,
              label: 'Transfer Amount (\$)',
              hint: '100.00',
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              validator: (v) {
                final n = double.tryParse(v ?? '');
                if (n == null || n <= 0) return 'Valid amount required';
                return null;
              },
            ),
            if (accounts.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Source / Destination Account', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
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
            ],
            const SizedBox(height: 24),
            CustomButton(
              text: _type == 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal',
              isLoading: _isLoading,
              onPressed: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
