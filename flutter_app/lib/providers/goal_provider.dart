import 'package:flutter/material.dart';
import '../models/goal_model.dart';
import '../repositories/goal_repository.dart';

class GoalProvider with ChangeNotifier {
  final GoalRepository _repository;

  List<GoalModel> _goals = [];
  bool _isLoading = false;
  String? _errorMessage;

  GoalProvider({GoalRepository? repository}) : _repository = repository ?? GoalRepository();

  List<GoalModel> get goals => _goals;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  double get totalTarget => _goals.fold(0.0, (sum, g) => sum + g.target);
  double get totalCurrent => _goals.fold(0.0, (sum, g) => sum + g.current);
  double get overallProgress => totalTarget > 0 ? (totalCurrent / totalTarget).clamp(0.0, 1.0) : 0.0;

  Future<void> fetchGoals() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _goals = await _repository.getGoals();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createGoal(GoalModel goal) async {
    try {
      final created = await _repository.createGoal(goal);
      _goals.add(created);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateGoal(String id, Map<String, dynamic> data) async {
    try {
      final updated = await _repository.updateGoal(id, data);
      final index = _goals.indexWhere((g) => g.id == id);
      if (index != -1) {
        _goals[index] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<GoalContributionResult?> contribute(String id, double amount, {String type = 'deposit', String? accountId}) async {
    try {
      final result = await _repository.contribute(id, amount, type: type, accountId: accountId);
      final index = _goals.indexWhere((g) => g.id == id);
      if (index != -1) {
        _goals[index] = result.goal;
        notifyListeners();
      }
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> deleteGoal(String id) async {
    try {
      await _repository.deleteGoal(id);
      _goals.removeWhere((g) => g.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
