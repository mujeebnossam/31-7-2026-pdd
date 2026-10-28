class BillModel {
  final String id;
  final String name;
  final double amount;
  final int dueDay;
  final String dueDate;
  final String category;
  final String frequency;
  final String status; // 'upcoming' | 'due' | 'due_soon' | 'overdue' | 'paid'
  final bool autopay;
  final String? paidDate;
  final String description;
  final String icon;
  final String color;

  BillModel({
    required this.id,
    required this.name,
    required this.amount,
    required this.dueDay,
    required this.dueDate,
    this.category = 'Utilities',
    this.frequency = 'monthly',
    this.status = 'upcoming',
    this.autopay = false,
    this.paidDate,
    this.description = '',
    this.icon = '📄',
    this.color = '#6366F1',
  });

  bool get isOverdue => status == 'overdue';
  bool get isPaid => status == 'paid';
  bool get isDueSoon => status == 'due_soon' || status == 'due';

  factory BillModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    int parseDay(dynamic val) {
      if (val == null) return 1;
      if (val is int) return val;
      return int.tryParse(val.toString()) ?? 1;
    }

    return BillModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['title']?.toString() ?? 'Bill',
      amount: parseNum(json['amount']),
      dueDay: parseDay(json['dueDay']),
      dueDate: json['dueDate']?.toString() ?? DateTime.now().toIso8601String().split('T')[0],
      category: json['category']?.toString() ?? 'Utilities',
      frequency: json['frequency']?.toString().toLowerCase() ?? 'monthly',
      status: json['status']?.toString() ?? 'upcoming',
      autopay: json['autopay'] == true || json['autoPay'] == true,
      paidDate: json['paidDate']?.toString(),
      description: json['description']?.toString() ?? '',
      icon: json['icon']?.toString() ?? '📄',
      color: json['color']?.toString() ?? '#6366F1',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'amount': amount,
      'dueDay': dueDay,
      'dueDate': dueDate,
      'category': category,
      'frequency': frequency,
      'autopay': autopay,
      'description': description,
      'icon': icon,
      'color': color,
    };
  }
}

class BillPayResult {
  final String message;
  final BillModel bill;

  BillPayResult({required this.message, required this.bill});

  factory BillPayResult.fromJson(Map<String, dynamic> json) {
    return BillPayResult(
      message: json['message']?.toString() ?? 'Bill paid successfully',
      bill: BillModel.fromJson(json['bill'] as Map<String, dynamic>),
    );
  }
}
