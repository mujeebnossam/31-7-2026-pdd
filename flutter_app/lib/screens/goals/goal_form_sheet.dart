import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/goal_model.dart';
import '../../providers/goal_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class GoalFormSheet extends StatefulWidget {
  final GoalModel? goalToEdit;

  const GoalFormSheet({super.key, this.goalToEdit});

  @override
  State<GoalFormSheet> createState() => _GoalFormSheetState();
}

class _GoalFormSheetState extends State<GoalFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _targetController;
  late TextEditingController _currentController;
  late TextEditingController _descriptionController;
  DateTime? _selectedDeadline;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final g = widget.goalToEdit;
    _nameController = TextEditingController(text: g?.name ?? '');
    _targetController = TextEditingController(text: g != null ? g.target.toStringAsFixed(2) : '');
    _currentController = TextEditingController(text: g != null ? g.current.toStringAsFixed(2) : '0.00');
    _descriptionController = TextEditingController(text: g?.description ?? '');
    if (g?.deadline != null) {
      try {
        _selectedDeadline = DateTime.parse(g!.deadline!);
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _targetController.dispose();
    _currentController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final goalProvider = context.read<GoalProvider>();

    final target = double.tryParse(_targetController.text.trim()) ?? 0.0;
    final current = double.tryParse(_currentController.text.trim()) ?? 0.0;

    bool success;
    if (widget.goalToEdit == null) {
      final newGoal = GoalModel(
        id: '',
        name: _nameController.text.trim(),
        target: target,
        current: current,
        deadline: _selectedDeadline?.toIso8601String().split('T')[0],
        description: _descriptionController.text.trim(),
      );
      success = await goalProvider.createGoal(newGoal);
    } else {
      success = await goalProvider.updateGoal(widget.goalToEdit!.id, {
        'name': _nameController.text.trim(),
        'target': target,
        'current': current,
        'deadline': _selectedDeadline?.toIso8601String().split('T')[0],
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
          content: Text(goalProvider.errorMessage ?? 'Failed to save goal'),
          backgroundColor: AppColors.expense,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.goalToEdit != null;

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
                    isEditing ? 'Edit Goal' : 'Create Financial Goal',
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
                label: 'Goal Name',
                hint: 'e.g. Emergency Fund, New Laptop',
                validator: (v) => v == null || v.trim().isEmpty ? 'Name is required' : null,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _targetController,
                      label: 'Target Amount (\$)',
                      hint: '5000.00',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (v) {
                        final n = double.tryParse(v ?? '');
                        if (n == null || n <= 0) return 'Valid target required';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      controller: _currentController,
                      label: 'Current Saved (\$)',
                      hint: '0.00',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              CustomTextField(
                controller: _descriptionController,
                label: 'Description / Purpose (Optional)',
                hint: '3-6 months living expenses reserve...',
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: isEditing ? 'Update Goal' : 'Save Goal',
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
