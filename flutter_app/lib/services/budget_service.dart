import '../core/config/api_config.dart';
import '../core/network/api_client.dart';
import '../models/budget_model.dart';

class BudgetService {
  final ApiClient _client;

  BudgetService({ApiClient? client}) : _client = client ?? ApiClient();

  Future<List<BudgetModel>> getBudgets({String? month}) async {
    final queryParams = <String, dynamic>{};
    if (month != null && month.isNotEmpty) queryParams['month'] = month;

    final res = await _client.get(ApiConfig.budgets, queryParams: queryParams);
    if (res is List) {
      return res.map((e) => BudgetModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<BudgetModel> createBudget(BudgetModel budget) async {
    final res = await _client.post(
      ApiConfig.budgets,
      body: budget.toJson(),
    );
    return BudgetModel.fromJson(res as Map<String, dynamic>);
  }

  Future<BudgetModel> updateBudget(String id, Map<String, dynamic> data) async {
    final res = await _client.put(
      ApiConfig.budgetById(id),
      body: data,
    );
    return BudgetModel.fromJson(res as Map<String, dynamic>);
  }

  Future<void> deleteBudget(String id) async {
    await _client.delete(ApiConfig.budgetById(id));
  }
}
