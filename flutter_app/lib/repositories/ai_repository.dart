import '../models/ai_models.dart';
import '../services/ai_service.dart';

class AIRepository {
  final AIService _service;

  AIRepository({AIService? service}) : _service = service ?? AIService();

  Future<FinancialSummaryModel> getSummary() async {
    return await _service.getSummary();
  }

  Future<List<AIInsightModel>> getInsights() async {
    return await _service.getInsights();
  }

  Future<FinancialPredictionsModel> getPredictions() async {
    return await _service.getPredictions();
  }

  Future<AIChatResponse> chat(String prompt, {String? conversationId}) async {
    return await _service.chat(prompt, conversationId: conversationId);
  }

  Future<List<AIConversationModel>> getConversations() async {
    return await _service.getConversations();
  }

  Future<void> clearConversations() async {
    await _service.clearConversations();
  }

  Future<CategorySuggestionModel> suggestCategory(String merchant) async {
    return await _service.suggestCategory(merchant);
  }
}
