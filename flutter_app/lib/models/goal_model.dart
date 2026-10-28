class GoalModel {
  final String id;
  final String name;
  final double target;
  final double current;
  final String? deadline;
  final String category;
  final String description;
  final String icon;
  final String color;

  GoalModel({
    required this.id,
    required this.name,
    required this.target,
    required this.current,
    this.deadline,
    this.category = 'Savings',
    this.description = '',
    this.icon = '🎯',
    this.color = '#10B981',
  });

  double get progress => target > 0 ? (current / target).clamp(0.0, 1.0) : 0.0;
  double get remaining => (target - current).clamp(0.0, double.infinity);
  bool get isCompleted => current >= target;

  factory GoalModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    return GoalModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Goal',
      target: parseNum(json['target'] ?? json['targetAmount']),
      current: parseNum(json['current'] ?? json['currentAmount']),
      deadline: json['deadline']?.toString() ?? json['targetDate']?.toString(),
      category: json['category']?.toString() ?? 'Savings',
      description: json['description']?.toString() ?? '',
      icon: json['icon']?.toString() ?? '🎯',
      color: json['color']?.toString() ?? '#10B981',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'target': target,
      'current': current,
      if (deadline != null) 'deadline': deadline,
      'category': category,
      'description': description,
      'icon': icon,
      'color': color,
    };
  }
}

class GoalContributionResult {
  final String message;
  final GoalModel goal;
  final double? accountBalanceAfter;

  GoalContributionResult({
    required this.message,
    required this.goal,
    this.accountBalanceAfter,
  });

  factory GoalContributionResult.fromJson(Map<String, dynamic> json) {
    return GoalContributionResult(
      message: json['message']?.toString() ?? 'Goal updated successfully',
      goal: GoalModel.fromJson(json['goal'] as Map<String, dynamic>),
      accountBalanceAfter: json['accountBalanceAfter'] != null
          ? (json['accountBalanceAfter'] is num
              ? (json['accountBalanceAfter'] as num).toDouble()
              : double.tryParse(json['accountBalanceAfter'].toString()))
          : null,
    );
  }
}
