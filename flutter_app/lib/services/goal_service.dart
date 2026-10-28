import '../core/config/api_config.dart';
import '../core/network/api_client.dart';
import '../models/goal_model.dart';

class GoalService {
  final ApiClient _client;

  GoalService({ApiClient? client}) : _client = client ?? ApiClient();

  Future<List<GoalModel>> getGoals() async {
    final res = await _client.get(ApiConfig.goals);
    if (res is List) {
      return res.map((e) => GoalModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<GoalModel> createGoal(GoalModel goal) async {
    final res = await _client.post(
      ApiConfig.goals,
      body: goal.toJson(),
    );
    return GoalModel.fromJson(res as Map<String, dynamic>);
  }

  Future<GoalModel> updateGoal(String id, Map<String, dynamic> data) async {
    final res = await _client.put(
      ApiConfig.goalById(id),
      body: data,
    );
    return GoalModel.fromJson(res as Map<String, dynamic>);
  }

  Future<GoalContributionResult> contribute(String id, double amount, {String type = 'deposit', String? accountId}) async {
    final res = await _client.post(
      ApiConfig.goalContribute(id),
      body: {
        'amount': amount,
        'type': type,
        if (accountId != null) 'accountId': accountId,
      },
    );
    return GoalContributionResult.fromJson(res as Map<String, dynamic>);
  }

  Future<void> deleteGoal(String id) async {
    await _client.delete(ApiConfig.goalById(id));
  }
}
