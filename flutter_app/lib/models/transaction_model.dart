class TransactionModel {
  final String id;
  final String title;
  final String merchant;
  final double amount;
  final String type; // 'income' | 'expense'
  final String category;
  final String date;
  final String icon;
  final String status;
  final String notes;
  final String? accountId;
  final String source;
  final String? externalTransactionId;

  TransactionModel({
    required this.id,
    required this.title,
    required this.merchant,
    required this.amount,
    required this.type,
    required this.category,
    required this.date,
    this.icon = '💳',
    this.status = 'cleared',
    this.notes = '',
    this.accountId,
    this.source = 'manual',
    this.externalTransactionId,
  });

  bool get isExpense => type == 'expense' || amount < 0;

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    double parsedAmount = 0.0;
    if (json['amount'] != null) {
      if (json['amount'] is num) {
        parsedAmount = (json['amount'] as num).toDouble();
      } else {
        parsedAmount = double.tryParse(json['amount'].toString()) ?? 0.0;
      }
    }

    final rawType = json['type']?.toString().toLowerCase() ?? 'expense';
    final resolvedType = (rawType == 'income' || rawType == 'expense') ? rawType : (parsedAmount < 0 ? 'expense' : 'income');
    final absAmount = parsedAmount.abs();

    return TransactionModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? json['merchant']?.toString() ?? 'Transaction',
      merchant: json['merchant']?.toString() ?? json['title']?.toString() ?? 'Transaction',
      amount: absAmount,
      type: resolvedType,
      category: json['category']?.toString() ?? 'Other',
      date: json['date']?.toString() ?? DateTime.now().toIso8601String().split('T')[0],
      icon: json['icon']?.toString() ?? (resolvedType == 'income' ? '💰' : '💳'),
      status: json['status']?.toString() ?? 'cleared',
      notes: json['notes']?.toString() ?? '',
      accountId: json['accountId']?.toString(),
      source: json['source']?.toString() ?? 'manual',
      externalTransactionId: json['externalTransactionId']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'merchant': merchant,
      'amount': amount,
      'type': type,
      'category': category,
      'date': date,
      'icon': icon,
      'notes': notes,
      if (accountId != null) 'accountId': accountId,
    };
  }
}
