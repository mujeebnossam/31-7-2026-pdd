import '../core/config/api_config.dart';
import '../core/network/api_client.dart';
import '../models/ai_models.dart';

class AIService {
  final ApiClient _client;

  AIService({ApiClient? client}) : _client = client ?? ApiClient();

  Future<FinancialSummaryModel> getSummary() async {
    final res = await _client.get(ApiConfig.aiSummary);
    return FinancialSummaryModel.fromJson(res as Map<String, dynamic>);
  }

  Future<List<AIInsightModel>> getInsights() async {
    final res = await _client.get(ApiConfig.aiInsights);
    if (res is List) {
      return res.map((e) => AIInsightModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<FinancialPredictionsModel> getPredictions() async {
    final res = await _client.get(ApiConfig.aiPredictions);
    return FinancialPredictionsModel.fromJson(res as Map<String, dynamic>);
  }

  Future<AIChatResponse> chat(String prompt, {String? conversationId}) async {
    final res = await _client.post(
      ApiConfig.aiChat,
      body: {
        'prompt': prompt,
        if (conversationId != null) 'conversationId': conversationId,
      },
    );
    return AIChatResponse.fromJson(res as Map<String, dynamic>);
  }

  Future<List<AIConversationModel>> getConversations() async {
    final res = await _client.get(ApiConfig.aiConversations);
    if (res is List) {
      return res.map((e) => AIConversationModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<void> clearConversations() async {
    await _client.delete(ApiConfig.aiConversations);
  }

  Future<CategorySuggestionModel> suggestCategory(String merchant) async {
    final res = await _client.post(
      ApiConfig.aiSuggestCategory,
      body: {'merchant': merchant},
    );
    return CategorySuggestionModel.fromJson(res as Map<String, dynamic>);
  }
}
