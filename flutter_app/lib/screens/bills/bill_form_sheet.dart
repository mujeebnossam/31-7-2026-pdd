import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/bill_model.dart';
import '../../providers/bill_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class BillFormSheet extends StatefulWidget {
  final BillModel? billToEdit;

  const BillFormSheet({super.key, this.billToEdit});

  @override
  State<BillFormSheet> createState() => _BillFormSheetState();
}

class _BillFormSheetState extends State<BillFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _amountController;
  late TextEditingController _dueDayController;
  late TextEditingController _descriptionController;

  String _frequency = 'monthly';
  String _category = 'Utilities';
  bool _autopay = false;
  bool _isLoading = false;

  final List<String> _frequencies = ['monthly', 'weekly', 'quarterly', 'yearly'];
  final List<String> _categories = ['Utilities', 'Housing', 'Subscriptions', 'Insurance', 'Credit Card', 'Other'];

  @override
  void initState() {
    super.initState();
    final b = widget.billToEdit;
    _nameController = TextEditingController(text: b?.name ?? '');
    _amountController = TextEditingController(text: b != null ? b.amount.toStringAsFixed(2) : '');
    _dueDayController = TextEditingController(text: b?.dueDay.toString() ?? '1');
    _descriptionController = TextEditingController(text: b?.description ?? '');
    if (b != null) {
      if (_frequencies.contains(b.frequency.toLowerCase())) _frequency = b.frequency.toLowerCase();
      if (_categories.contains(b.category)) _category = b.category;
      _autopay = b.autopay;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _amountController.dispose();
    _dueDayController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final billProvider = context.read<BillProvider>();

    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    final dueDay = int.tryParse(_dueDayController.text.trim()) ?? 1;

    bool success;
    if (widget.billToEdit == null) {
      final newBill = BillModel(
        id: '',
        name: _nameController.text.trim(),
        amount: amount,
        dueDay: dueDay,
        dueDate: DateTime.now().toIso8601String().split('T')[0],
        category: _category,
        frequency: _frequency,
        autopay: _autopay,
        description: _descriptionController.text.trim(),
      );
      success = await billProvider.createBill(newBill);
    } else {
      success = await billProvider.updateBill(widget.billToEdit!.id, {
        'name': _nameController.text.trim(),
        'amount': amount,
        'dueDay': dueDay,
        'category': _category,
        'frequency': _frequency,
        'autopay': _autopay,
        'description': _descriptionController.text.trim(),
      });
    }

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(billProvider.errorMessage ?? 'Failed to save bill'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.billToEdit != null;

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
                    isEditing ? 'Edit Bill' : 'Add Bill / Subscription',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _nameController,
                label: 'Bill Name / Payee',
                hint: 'e.g. Electric Utility, Netflix',
                validator: (v) => v == null || v.trim().isEmpty ? 'Name is required' : null,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _amountController,
                      label: 'Amount (\$)',
                      hint: '85.00',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (v) {
                        final n = double.tryParse(v ?? '');
                        if (n == null || n <= 0) return 'Valid amount required';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      controller: _dueDayController,
                      label: 'Day of Month (1-31)',
                      hint: '15',
                      keyboardType: TextInputType.number,
                      validator: (v) {
                        final d = int.tryParse(v ?? '');
                        if (d == null || d < 1 || d > 31) return '1-31';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Frequency', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _frequency,
                          decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12)),
                          items: _frequencies.map((f) => DropdownMenuItem(value: f, child: Text(f.toUpperCase()))).toList(),
                          onChanged: (v) => setState(() => _frequency = v ?? _frequency),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Category', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _category,
                          decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12)),
                          items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                          onChanged: (v) => setState(() => _category = v ?? _category),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Autopay Enabled', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                subtitle: const Text('Mark obligation as automated direct debit', style: TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                value: _autopay,
                onChanged: (v) => setState(() => _autopay = v),
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: isEditing ? 'Update Bill' : 'Add Bill',
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
