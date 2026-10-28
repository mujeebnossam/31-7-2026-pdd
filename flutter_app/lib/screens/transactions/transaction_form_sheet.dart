import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/transaction_model.dart';
import '../../providers/account_provider.dart';
import '../../providers/ai_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class TransactionFormSheet extends StatefulWidget {
  final TransactionModel? transactionToEdit;

  const TransactionFormSheet({super.key, this.transactionToEdit});

  @override
  State<TransactionFormSheet> createState() => _TransactionFormSheetState();
}

class _TransactionFormSheetState extends State<TransactionFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _merchantController;
  late TextEditingController _amountController;
  late TextEditingController _notesController;

  String _type = 'expense'; // 'expense' | 'income'
  String _category = 'Food & Drink';
  String? _selectedAccountId;
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;
  String? _aiSuggestedCategory;

  final List<String> _categories = [
    'Food & Drink',
    'Housing',
    'Utilities',
    'Transportation',
    'Groceries',
    'Entertainment',
    'Shopping',
    'Health & Medical',
    'Salary',
    'Subscriptions',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    final tx = widget.transactionToEdit;
    _titleController = TextEditingController(text: tx?.title ?? '');
    _merchantController = TextEditingController(text: tx?.merchant ?? '');
    _amountController = TextEditingController(text: tx != null ? tx.amount.toStringAsFixed(2) : '');
    _notesController = TextEditingController(text: tx?.notes ?? '');
    if (tx != null) {
      _type = tx.type;
      _category = tx.category;
      _selectedAccountId = tx.accountId;
      try {
        _selectedDate = DateTime.parse(tx.date);
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _merchantController.dispose();
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _checkAISuggestion(String merchant) async {
    if (merchant.trim().length < 3) return;
    final aiProvider = context.read<AIProvider>();
    final suggestion = await aiProvider.suggestCategory(merchant);
    if (suggestion != null && mounted) {
      setState(() {
        _aiSuggestedCategory = suggestion.category;
      });
    }
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final txProvider = context.read<TransactionProvider>();
    final parsedAmount = double.tryParse(_amountController.text.trim()) ?? 0.0;

    final itemTitle = _titleController.text.trim().isNotEmpty
        ? _titleController.text.trim()
        : _merchantController.text.trim();

    final itemMerchant = _merchantController.text.trim().isNotEmpty
        ? _merchantController.text.trim()
        : itemTitle;

    bool success;
    if (widget.transactionToEdit == null) {
      final newTx = TransactionModel(
        id: '',
        title: itemTitle,
        merchant: itemMerchant,
        amount: parsedAmount,
        type: _type,
        category: _category,
        date: _selectedDate.toIso8601String().split('T')[0],
        notes: _notesController.text.trim(),
        accountId: _selectedAccountId,
      );
      success = await txProvider.createTransaction(newTx);
    } else {
      success = await txProvider.updateTransaction(widget.transactionToEdit!.id, {
        'title': itemTitle,
        'merchant': itemMerchant,
        'amount': parsedAmount,
        'type': _type,
        'category': _category,
        'date': _selectedDate.toIso8601String().split('T')[0],
        'notes': _notesController.text.trim(),
        'accountId': _selectedAccountId,
      });
    }

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      // Also trigger accounts refresh to update balances
      context.read<AccountProvider>().fetchAccounts();
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(txProvider.errorMessage ?? 'Failed to save transaction'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.transactionToEdit != null;
    final accountProvider = context.watch<AccountProvider>();

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isEditing ? 'Edit Transaction' : 'New Transaction',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Type Switcher (Expense / Income)
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'expense', label: Text('Expense'), icon: Icon(Icons.arrow_upward, size: 16)),
                  ButtonSegment(value: 'income', label: Text('Income'), icon: Icon(Icons.arrow_downward, size: 16)),
                ],
                selected: {_type},
                onSelectionChanged: (set) => setState(() => _type = set.first),
              ),
              const SizedBox(height: 16),

              // Amount
              CustomTextField(
                controller: _amountController,
                label: 'Amount (\$)',
                hint: '0.00',
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) {
                  final n = double.tryParse(v ?? '');
                  if (n == null || n <= 0) return 'Enter a valid amount greater than 0';
                  return null;
                },
              ),
              const SizedBox(height: 12),

              // Merchant / Title
              CustomTextField(
                controller: _merchantController,
                label: 'Merchant / Payee',
                hint: 'e.g. Starbucks, Uber, Netflix, Salary',
                onChanged: (v) => _checkAISuggestion(v),
                validator: (v) => v == null || v.trim().isEmpty ? 'Merchant name is required' : null,
              ),
              const SizedBox(height: 12),

              // AI Suggested Category Chip
              if (_aiSuggestedCategory != null && _aiSuggestedCategory != _category) ...[
                GestureDetector(
                  onTap: () {
                    setState(() {
                      if (_categories.contains(_aiSuggestedCategory)) {
                        _category = _aiSuggestedCategory!;
                      }
                      _aiSuggestedCategory = null;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.primaryLight.withOpacity(0.4)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.auto_awesome, size: 16, color: AppColors.primaryLight),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'AI Suggested Category: $_aiSuggestedCategory (Tap to apply)',
                            style: const TextStyle(fontSize: 12, color: AppColors.primaryLight, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // Category Selector
              const Text('Category', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _categories.contains(_category) ? _category : 'Other',
                decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
                items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) => setState(() => _category = v ?? _category),
              ),
              const SizedBox(height: 12),

              // Account Selector
              if (accountProvider.accounts.isNotEmpty) ...[
                const Text('Account', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: _selectedAccountId,
                  hint: const Text('Select Account (Optional)'),
                  decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
                  items: accountProvider.accounts.map((a) {
                    return DropdownMenuItem(
                      value: a.id,
                      child: Text('${a.name} (${a.bank})'),
                    );
                  }).toList(),
                  onChanged: (v) => setState(() => _selectedAccountId = v),
                ),
                const SizedBox(height: 12),
              ],

              // Notes
              CustomTextField(
                controller: _notesController,
                label: 'Notes (Optional)',
                hint: 'Tax deductible, lunch with team...',
              ),
              const SizedBox(height: 24),

              CustomButton(
                text: isEditing ? 'Update Transaction' : 'Add Transaction',
                isLoading: _isLoading,
                onPressed: _handleSave,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
