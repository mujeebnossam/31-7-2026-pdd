class AIChatMessage {
  final String id;
  final String role; // 'user' | 'assistant'
  final String content;
  final DateTime timestamp;

  AIChatMessage({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
  });

  bool get isUser => role == 'user';

  factory AIChatMessage.fromJson(Map<String, dynamic> json) {
    return AIChatMessage(
      id: json['id']?.toString() ?? '',
      role: json['role']?.toString() ?? 'user',
      content: json['content']?.toString() ?? '',
      timestamp: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class AIChatResponse {
  final String response;
  final String conversationId;
  final String messageId;

  AIChatResponse({
    required this.response,
    required this.conversationId,
    required this.messageId,
  });

  factory AIChatResponse.fromJson(Map<String, dynamic> json) {
    return AIChatResponse(
      response: json['response']?.toString() ?? json['text']?.toString() ?? '',
      conversationId: json['conversationId']?.toString() ?? '',
      messageId: json['messageId']?.toString() ?? '',
    );
  }
}

class AIConversationModel {
  final String id;
  final String title;
  final List<AIChatMessage> messages;
  final DateTime updatedAt;

  AIConversationModel({
    required this.id,
    required this.title,
    required this.messages,
    required this.updatedAt,
  });

  factory AIConversationModel.fromJson(Map<String, dynamic> json) {
    final rawMsgs = json['messages'] as List<dynamic>? ?? [];
    return AIConversationModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Conversation',
      messages: rawMsgs.map((m) => AIChatMessage.fromJson(m as Map<String, dynamic>)).toList(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class AIInsightModel {
  final String id;
  final String type;
  final String title;
  final String description;
  final String severity; // 'info' | 'warning' | 'danger' | 'success'
  final String category;
  final String action;
  final String icon;
  final String? supportingMetric;

  AIInsightModel({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.severity,
    required this.category,
    required this.action,
    this.icon = '🤖',
    this.supportingMetric,
  });

  factory AIInsightModel.fromJson(Map<String, dynamic> json) {
    return AIInsightModel(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'recommendation',
      title: json['title']?.toString() ?? 'Financial Insight',
      description: json['description']?.toString() ?? '',
      severity: json['severity']?.toString() ?? 'info',
      category: json['category']?.toString() ?? 'General',
      action: json['action']?.toString() ?? 'Review your spending',
      icon: json['icon']?.toString() ?? '🤖',
      supportingMetric: json['supportingMetric']?.toString(),
    );
  }
}

class FinancialSummaryModel {
  final double netWorth;
  final double currentMonthIncome;
  final double currentMonthExpenses;
  final double currentMonthNet;
  final double savingsRate;
  final int financialHealthScore;
  final String financialHealthGrade;
  final int upcomingBillsCount;
  final double upcomingBillsTotal;
  final int overdueBillsCount;
  final double overdueBillsTotal;
  final List<Map<String, dynamic>> topCategories;
  final List<Map<String, dynamic>> subscriptions;
  final List<Map<String, dynamic>> anomalies;

  FinancialSummaryModel({
    required this.netWorth,
    required this.currentMonthIncome,
    required this.currentMonthExpenses,
    required this.currentMonthNet,
    required this.savingsRate,
    required this.financialHealthScore,
    required this.financialHealthGrade,
    required this.upcomingBillsCount,
    required this.upcomingBillsTotal,
    required this.overdueBillsCount,
    required this.overdueBillsTotal,
    required this.topCategories,
    required this.subscriptions,
    required this.anomalies,
  });

  factory FinancialSummaryModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    final curMonth = json['currentMonth'] as Map<String, dynamic>? ?? {};
    final finHealth = json['financialHealth'] as Map<String, dynamic>? ?? {};

    return FinancialSummaryModel(
      netWorth: parseNum(json['netWorth']),
      currentMonthIncome: parseNum(curMonth['income']),
      currentMonthExpenses: parseNum(curMonth['expenses']),
      currentMonthNet: parseNum(curMonth['net']),
      savingsRate: parseNum(curMonth['savingsRate']),
      financialHealthScore: (finHealth['score'] as num?)?.toInt() ?? 720,
      financialHealthGrade: finHealth['grade']?.toString() ?? 'Good',
      upcomingBillsCount: (json['upcomingBillsCount'] as num?)?.toInt() ?? 0,
      upcomingBillsTotal: parseNum(json['upcomingBillsTotal']),
      overdueBillsCount: (json['overdueBillsCount'] as num?)?.toInt() ?? 0,
      overdueBillsTotal: parseNum(json['overdueBillsTotal']),
      topCategories: (json['topCategories'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>(),
      subscriptions: (json['subscriptions'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>(),
      anomalies: (json['anomalies'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>(),
    );
  }
}

class FinancialPredictionsModel {
  final String confidence;
  final double predictedExpenses;
  final double predictedIncome;
  final double predictedNet;
  final String trajectoryTrend;
  final String trajectoryReason;
  final double projected3MonthSavings;
  final List<Map<String, dynamic>> categoryPredictions;
  final List<Map<String, dynamic>> goalPredictions;

  FinancialPredictionsModel({
    required this.confidence,
    required this.predictedExpenses,
    required this.predictedIncome,
    required this.predictedNet,
    required this.trajectoryTrend,
    required this.trajectoryReason,
    required this.projected3MonthSavings,
    required this.categoryPredictions,
    required this.goalPredictions,
  });

  factory FinancialPredictionsModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    final nextMo = json['nextMonth'] as Map<String, dynamic>? ?? {};
    final traj = json['trajectory'] as Map<String, dynamic>? ?? {};

    return FinancialPredictionsModel(
      confidence: json['confidence']?.toString() ?? 'medium',
      predictedExpenses: parseNum(nextMo['predictedExpenses']),
      predictedIncome: parseNum(nextMo['predictedIncome']),
      predictedNet: parseNum(nextMo['predictedNetCashFlow']),
      trajectoryTrend: traj['trend']?.toString() ?? 'stable',
      trajectoryReason: traj['reason']?.toString() ?? 'Consistent cashflow pattern',
      projected3MonthSavings: parseNum(traj['projected3MonthSavings']),
      categoryPredictions: (json['categoryPredictions'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>(),
      goalPredictions: (json['goalPredictions'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>(),
    );
  }
}

class CategorySuggestionModel {
  final String category;
  final double confidence;
  final String icon;

  CategorySuggestionModel({
    required this.category,
    required this.confidence,
    required this.icon,
  });

  factory CategorySuggestionModel.fromJson(Map<String, dynamic> json) {
    return CategorySuggestionModel(
      category: json['category']?.toString() ?? 'Other',
      confidence: (json['confidence'] is num)
          ? (json['confidence'] as num).toDouble()
          : double.tryParse(json['confidence'].toString()) ?? 0.5,
      icon: json['icon']?.toString() ?? '📄',
    );
  }
}
