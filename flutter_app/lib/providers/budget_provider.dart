import 'package:flutter/material.dart';
import '../models/budget_model.dart';
import '../repositories/budget_repository.dart';

class BudgetProvider with ChangeNotifier {
  final BudgetRepository _repository;

  List<BudgetModel> _budgets = [];
  bool _isLoading = false;
  String? _errorMessage;

  BudgetProvider({BudgetRepository? repository}) : _repository = repository ?? BudgetRepository();

  List<BudgetModel> get budgets => _budgets;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  double get totalBudgeted => _budgets.fold(0.0, (sum, b) => sum + b.budgeted);
  double get totalSpent => _budgets.fold(0.0, (sum, b) => sum + b.spent);
  double get totalRemaining => (totalBudgeted - totalSpent).clamp(0.0, double.infinity);

  Future<void> fetchBudgets({String? month}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _budgets = await _repository.getBudgets(month: month);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createBudget(BudgetModel budget) async {
    try {
      final created = await _repository.createBudget(budget);
      _budgets.add(created);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateBudget(String id, Map<String, dynamic> data) async {
    try {
      final updated = await _repository.updateBudget(id, data);
      final index = _budgets.indexWhere((b) => b.id == id);
      if (index != -1) {
        _budgets[index] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteBudget(String id) async {
    try {
      await _repository.deleteBudget(id);
      _budgets.removeWhere((b) => b.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
