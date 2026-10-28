import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/account_model.dart';
import '../../providers/account_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class AccountFormSheet extends StatefulWidget {
  final AccountModel? accountToEdit;

  const AccountFormSheet({super.key, this.accountToEdit});

  @override
  State<AccountFormSheet> createState() => _AccountFormSheetState();
}

class _AccountFormSheetState extends State<AccountFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _bankController;
  late TextEditingController _balanceController;
  late TextEditingController _last4Controller;
  String _selectedType = 'Checking';
  bool _isLoading = false;

  final List<String> _accountTypes = ['Checking', 'Savings', 'Credit Card', 'Investment', 'Cash Wallet'];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.accountToEdit?.name ?? '');
    _bankController = TextEditingController(text: widget.accountToEdit?.bank ?? 'Chase Bank');
    _balanceController = TextEditingController(text: widget.accountToEdit?.balance.toStringAsFixed(2) ?? '0.00');
    _last4Controller = TextEditingController(text: widget.accountToEdit?.last4 ?? '4421');
    if (widget.accountToEdit != null && _accountTypes.contains(widget.accountToEdit!.type)) {
      _selectedType = widget.accountToEdit!.type;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bankController.dispose();
    _balanceController.dispose();
    _last4Controller.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final accountProvider = context.read<AccountProvider>();

    final balance = double.tryParse(_balanceController.text.trim()) ?? 0.0;

    bool success;
    if (widget.accountToEdit == null) {
      final newAccount = AccountModel(
        id: '',
        name: _nameController.text.trim(),
        bank: _bankController.text.trim(),
        type: _selectedType,
        balance: balance,
        last4: _last4Controller.text.trim(),
      );
      success = await accountProvider.createAccount(newAccount);
    } else {
      success = await accountProvider.updateAccount(widget.accountToEdit!.id, {
        'name': _nameController.text.trim(),
        'bank': _bankController.text.trim(),
        'type': _selectedType,
        'balance': balance,
        'last4': _last4Controller.text.trim(),
      });
    }

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(accountProvider.errorMessage ?? 'Failed to save account'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.accountToEdit != null;

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
                  isEditing ? 'Edit Account' : 'Connect Account',
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
              label: 'Account Name',
              hint: 'e.g. Main Checking',
              validator: (v) => v == null || v.trim().isEmpty ? 'Name is required' : null,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _bankController,
              label: 'Institution / Bank',
              hint: 'e.g. Wells Fargo',
              validator: (v) => v == null || v.trim().isEmpty ? 'Bank is required' : null,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: CustomTextField(
                    controller: _balanceController,
                    label: 'Current Balance (\$)',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    validator: (v) => double.tryParse(v ?? '') == null ? 'Valid amount required' : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CustomTextField(
                    controller: _last4Controller,
                    label: 'Last 4 Digits',
                    hint: '1234',
                    keyboardType: TextInputType.number,
                    validator: (v) => v == null || v.length != 4 ? '4 digits' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text('Account Type', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _selectedType,
              decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
              items: _accountTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (v) => setState(() => _selectedType = v ?? _selectedType),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: isEditing ? 'Update Account' : 'Save Account',
              isLoading: _isLoading,
              onPressed: _handleSave,
            ),
          ],
        ),
      ),
    );
  }
}
