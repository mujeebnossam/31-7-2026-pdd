class DataProviderModel {
  final String id;
  final String name;
  final String type;
  final String status;
  final String description;
  final List<String> capabilities;
  final bool isConfigured;

  DataProviderModel({
    required this.id,
    required this.name,
    required this.type,
    required this.status,
    required this.description,
    required this.capabilities,
    required this.isConfigured,
  });

  factory DataProviderModel.fromJson(Map<String, dynamic> json) {
    return DataProviderModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Provider',
      type: json['type']?.toString() ?? 'CSV_IMPORT',
      status: json['status']?.toString() ?? 'ACTIVE',
      description: json['description']?.toString() ?? '',
      capabilities: (json['capabilities'] as List<dynamic>? ?? []).map((e) => e.toString()).toList(),
      isConfigured: json['isConfigured'] == true,
    );
  }
}

class NormalizedTransactionModel {
  final String date;
  final double amount;
  final String type;
  final String merchant;
  final String title;
  final String category;
  final double confidence;
  final String source;
  final bool isDuplicate;
  final String? duplicateReason;
  final bool isValid;

  NormalizedTransactionModel({
    required this.date,
    required this.amount,
    required this.type,
    required this.merchant,
    required this.title,
    required this.category,
    this.confidence = 0.9,
    this.source = 'CSV',
    this.isDuplicate = false,
    this.duplicateReason,
    this.isValid = true,
  });

  factory NormalizedTransactionModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    return NormalizedTransactionModel(
      date: json['date']?.toString() ?? '',
      amount: parseNum(json['amount']),
      type: json['type']?.toString() ?? 'expense',
      merchant: json['merchant']?.toString() ?? 'Merchant',
      title: json['title']?.toString() ?? 'Transaction',
      category: json['category']?.toString() ?? 'Other',
      confidence: parseNum(json['confidence']),
      source: json['source']?.toString() ?? 'CSV',
      isDuplicate: json['isDuplicate'] == true,
      duplicateReason: json['duplicateReason']?.toString(),
      isValid: json['isValid'] != false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'amount': amount,
      'type': type,
      'merchant': merchant,
      'title': title,
      'category': category,
      'confidence': confidence,
      'source': source,
      'isDuplicate': isDuplicate,
      'isValid': isValid,
    };
  }
}

class CSVParseResultModel {
  final int totalRows;
  final int validCount;
  final int invalidCount;
  final int duplicateCount;
  final double totalIncome;
  final double totalExpense;
  final List<NormalizedTransactionModel> rows;

  CSVParseResultModel({
    required this.totalRows,
    required this.validCount,
    required this.invalidCount,
    required this.duplicateCount,
    required this.totalIncome,
    required this.totalExpense,
    required this.rows,
  });

  factory CSVParseResultModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    final rawRows = json['rows'] as List<dynamic>? ?? [];
    return CSVParseResultModel(
      totalRows: (json['totalRows'] as num?)?.toInt() ?? 0,
      validCount: (json['validCount'] as num?)?.toInt() ?? 0,
      invalidCount: (json['invalidCount'] as num?)?.toInt() ?? 0,
      duplicateCount: (json['duplicateCount'] as num?)?.toInt() ?? 0,
      totalIncome: parseNum(json['totalIncome']),
      totalExpense: parseNum(json['totalExpense']),
      rows: rawRows.map((r) => NormalizedTransactionModel.fromJson(r as Map<String, dynamic>)).toList(),
    );
  }
}

class BatchImportResultModel {
  final int importedCount;
  final int skippedDuplicatesCount;
  final double totalInflow;
  final double totalOutflow;
  final double accountBalanceAfter;
  final String accountName;

  BatchImportResultModel({
    required this.importedCount,
    required this.skippedDuplicatesCount,
    required this.totalInflow,
    required this.totalOutflow,
    required this.accountBalanceAfter,
    required this.accountName,
  });

  factory BatchImportResultModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    return BatchImportResultModel(
      importedCount: (json['importedCount'] as num?)?.toInt() ?? 0,
      skippedDuplicatesCount: (json['skippedDuplicatesCount'] as num?)?.toInt() ?? 0,
      totalInflow: parseNum(json['totalInflow']),
      totalOutflow: parseNum(json['totalOutflow']),
      accountBalanceAfter: parseNum(json['accountBalanceAfter']),
      accountName: json['accountName']?.toString() ?? 'Account',
    );
  }
}

class DemoIngestionResultModel {
  final String merchant;
  final String category;
  final double confidence;
  final String accountName;
  final double balanceBefore;
  final double balanceAfter;
  final String aiInsightRecommendation;

  DemoIngestionResultModel({
    required this.merchant,
    required this.category,
    required this.confidence,
    required this.accountName,
    required this.balanceBefore,
    required this.balanceAfter,
    required this.aiInsightRecommendation,
  });

  factory DemoIngestionResultModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    return DemoIngestionResultModel(
      merchant: json['merchant']?.toString() ?? 'Merchant',
      category: json['category']?.toString() ?? 'Other',
      confidence: parseNum(json['confidence']),
      accountName: json['accountName']?.toString() ?? 'Primary Account',
      balanceBefore: parseNum(json['balanceBefore']),
      balanceAfter: parseNum(json['balanceAfter']),
      aiInsightRecommendation: json['aiInsightRecommendation']?.toString() ?? '',
    );
  }
}
