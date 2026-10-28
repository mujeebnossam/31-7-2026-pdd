import '../models/budget_model.dart';
import '../services/budget_service.dart';

class BudgetRepository {
  final BudgetService _service;

  BudgetRepository({BudgetService? service}) : _service = service ?? BudgetService();

  Future<List<BudgetModel>> getBudgets({String? month}) async {
    return await _service.getBudgets(month: month);
  }

  Future<BudgetModel> createBudget(BudgetModel budget) async {
    return await _service.createBudget(budget);
  }

  Future<BudgetModel> updateBudget(String id, Map<String, dynamic> data) async {
    return await _service.updateBudget(id, data);
  }

  Future<void> deleteBudget(String id) async {
    await _service.deleteBudget(id);
  }
}
