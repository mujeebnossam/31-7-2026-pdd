class AccountModel {
  final String id;
  final String name;
  final String type;
  final double balance;
  final String bank;
  final String last4;
  final String color;

  AccountModel({
    required this.id,
    required this.name,
    required this.type,
    required this.balance,
    this.bank = 'General',
    this.last4 = '0000',
    this.color = '#6366F1',
  });

  factory AccountModel.fromJson(Map<String, dynamic> json) {
    double parsedBalance = 0.0;
    if (json['balance'] != null) {
      if (json['balance'] is num) {
        parsedBalance = (json['balance'] as num).toDouble();
      } else {
        parsedBalance = double.tryParse(json['balance'].toString()) ?? 0.0;
      }
    }

    return AccountModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Account',
      type: json['type']?.toString() ?? 'Checking',
      balance: parsedBalance,
      bank: json['bank']?.toString() ?? 'General Bank',
      last4: json['last4']?.toString() ?? '0000',
      color: json['color']?.toString() ?? '#6366F1',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'balance': balance,
      'bank': bank,
      'last4': last4,
      'color': color,
    };
  }
}
