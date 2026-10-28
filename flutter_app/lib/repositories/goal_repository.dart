import '../models/goal_model.dart';
import '../services/goal_service.dart';

class GoalRepository {
  final GoalService _service;

  GoalRepository({GoalService? service}) : _service = service ?? GoalService();

  Future<List<GoalModel>> getGoals() async {
    return await _service.getGoals();
  }

  Future<GoalModel> createGoal(GoalModel goal) async {
    return await _service.createGoal(goal);
  }

  Future<GoalModel> updateGoal(String id, Map<String, dynamic> data) async {
    return await _service.updateGoal(id, data);
  }

  Future<GoalContributionResult> contribute(String id, double amount, {String type = 'deposit', String? accountId}) async {
    return await _service.contribute(id, amount, type: type, accountId: accountId);
  }

  Future<void> deleteGoal(String id) async {
    await _service.deleteGoal(id);
  }
}
