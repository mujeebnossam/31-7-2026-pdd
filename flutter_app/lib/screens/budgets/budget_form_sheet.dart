import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/budget_model.dart';
import '../../providers/budget_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class BudgetFormSheet extends StatefulWidget {
  final BudgetModel? budgetToEdit;

  const BudgetFormSheet({super.key, this.budgetToEdit});

  @override
  State<BudgetFormSheet> createState() => _BudgetFormSheetState();
}

class _BudgetFormSheetState extends State<BudgetFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _budgetedController;
  String _selectedCategory = 'Food & Drink';
  bool _isLoading = false;

  final List<String> _categories = [
    'Food & Drink',
    'Housing',
    'Utilities',
    'Transportation',
    'Groceries',
    'Entertainment',
    'Shopping',
    'Health & Medical',
    'Subscriptions',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    _budgetedController = TextEditingController(
      text: widget.budgetToEdit != null ? widget.budgetToEdit!.budgeted.toStringAsFixed(2) : '',
    );
    if (widget.budgetToEdit != null && _categories.contains(widget.budgetToEdit!.category)) {
      _selectedCategory = widget.budgetToEdit!.category;
    }
  }

  @override
  void dispose() {
    _budgetedController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final budgetProvider = context.read<BudgetProvider>();
    final amount = double.tryParse(_budgetedController.text.trim()) ?? 0.0;

    bool success;
    if (widget.budgetToEdit == null) {
      final newBudget = BudgetModel(
        id: '',
        category: _selectedCategory,
        budgeted: amount,
      );
      success = await budgetProvider.createBudget(newBudget);
    } else {
      success = await budgetProvider.updateBudget(widget.budgetToEdit!.id, {
        'category': _selectedCategory,
        'budgeted': amount,
      });
    }

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(budgetProvider.errorMessage ?? 'Failed to save budget'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.budgetToEdit != null;

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
                  isEditing ? 'Edit Budget' : 'Set Category Budget',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Category', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
              items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
              onChanged: (v) => setState(() => _selectedCategory = v ?? _selectedCategory),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _budgetedController,
              label: 'Monthly Limit (\$)',
              hint: '500.00',
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              validator: (v) {
                final n = double.tryParse(v ?? '');
                if (n == null || n <= 0) return 'Enter a valid amount greater than 0';
                return null;
              },
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: isEditing ? 'Update Budget' : 'Create Budget',
              isLoading: _isLoading,
              onPressed: _handleSave,
            ),
          ],
        ),
      ),
    );
  }
}
