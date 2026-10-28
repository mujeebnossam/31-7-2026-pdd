class BudgetModel {
  final String id;
  final String category;
  final double budgeted;
  final double spent;
  final String period;
  final String color;
  final String icon;

  BudgetModel({
    required this.id,
    required this.category,
    required this.budgeted,
    this.spent = 0.0,
    this.period = '',
    this.color = '#6366F1',
    this.icon = '📊',
  });

  double get remaining => (budgeted - spent).clamp(0.0, double.infinity);
  double get utilization => budgeted > 0 ? (spent / budgeted).clamp(0.0, 2.0) : 0.0;
  bool get isOverBudget => spent > budgeted;

  factory BudgetModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    return BudgetModel(
      id: json['id']?.toString() ?? '',
      category: json['category']?.toString() ?? 'General',
      budgeted: parseNum(json['budgeted']),
      spent: parseNum(json['spent']),
      period: json['period']?.toString() ?? '',
      color: json['color']?.toString() ?? '#6366F1',
      icon: json['icon']?.toString() ?? '📊',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'category': category,
      'budgeted': budgeted,
      'color': color,
      'icon': icon,
      if (period.isNotEmpty) 'period': period,
    };
  }
}
