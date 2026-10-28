import 'package:flutter/material.dart';
import '../models/ai_models.dart';
import '../repositories/ai_repository.dart';

class AIProvider with ChangeNotifier {
  final AIRepository _repository;

  FinancialSummaryModel? _summary;
  List<AIInsightModel> _insights = [];
  FinancialPredictionsModel? _predictions;
  List<AIConversationModel> _conversations = [];

  bool _isLoadingIntelligence = false;
  String? _intelligenceError;

  // AI Chat State
  final List<AIChatMessage> _chatMessages = [];
  String? _activeConversationId;
  bool _isThinking = false;
  String? _chatError;

  AIProvider({AIRepository? repository}) : _repository = repository ?? AIRepository() {
    // Initial welcome message from SpendWise AI
    _chatMessages.add(
      AIChatMessage(
        id: 'initial_msg',
        role: 'assistant',
        content:
            "Hello! I'm **SpendWise AI**, your personal financial intelligence advisor. I have real-time access to your ledger. Ask me about your spending patterns, savings opportunities, upcoming bills, goals, or next-month predictions!",
        timestamp: DateTime.now(),
      ),
    );
  }

  FinancialSummaryModel? get summary => _summary;
  List<AIInsightModel> get insights => _insights;
  FinancialPredictionsModel? get predictions => _predictions;
  List<AIConversationModel> get conversations => _conversations;
  bool get isLoadingIntelligence => _isLoadingIntelligence;
  String? get intelligenceError => _intelligenceError;

  List<AIChatMessage> get chatMessages => _chatMessages;
  String? get activeConversationId => _activeConversationId;
  bool get isThinking => _isThinking;
  String? get chatError => _chatError;

  Future<void> fetchIntelligenceData() async {
    _isLoadingIntelligence = true;
    _intelligenceError = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _repository.getSummary(),
        _repository.getInsights(),
        _repository.getPredictions(),
      ]);

      _summary = results[0] as FinancialSummaryModel;
      _insights = results[1] as List<AIInsightModel>;
      _predictions = results[2] as FinancialPredictionsModel;
      _isLoadingIntelligence = false;
      notifyListeners();
    } catch (e) {
      _intelligenceError = e.toString();
      _isLoadingIntelligence = false;
      notifyListeners();
    }
  }

  Future<void> fetchConversations() async {
    try {
      _conversations = await _repository.getConversations();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> sendChatMessage(String prompt) async {
    final cleanPrompt = prompt.trim();
    if (cleanPrompt.isEmpty || _isThinking) return;

    // 1. Add user message
    _chatMessages.add(
      AIChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        role: 'user',
        content: cleanPrompt,
        timestamp: DateTime.now(),
      ),
    );
    _isThinking = true;
    _chatError = null;
    notifyListeners();

    try {
      // 2. Query the existing backend at POST /api/ai/chat
      final response = await _repository.chat(
        cleanPrompt,
        conversationId: _activeConversationId,
      );

      if (response.conversationId.isNotEmpty) {
        _activeConversationId = response.conversationId;
      }

      // 3. Add assistant response
      _chatMessages.add(
        AIChatMessage(
          id: response.messageId.isNotEmpty
              ? response.messageId
              : DateTime.now().millisecondsSinceEpoch.toString(),
          role: 'assistant',
          content: response.response.isNotEmpty
              ? response.response
              : "I have processed your financial request.",
          timestamp: DateTime.now(),
        ),
      );
      _isThinking = false;
      notifyListeners();
    } catch (e) {
      _isThinking = false;
      _chatError = e.toString();
      _chatMessages.add(
        AIChatMessage(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          role: 'assistant',
          content:
              "⚠️ **Error communicating with SpendWise advisor:** $e\n\n*Your ledger calculations are still safe.*",
          timestamp: DateTime.now(),
        ),
      );
      notifyListeners();
    }
  }

  Future<void> clearChat() async {
    try {
      await _repository.clearConversations();
    } catch (_) {}

    _activeConversationId = null;
    _chatMessages.clear();
    _chatMessages.add(
      AIChatMessage(
        id: 'initial_cleared',
        role: 'assistant',
        content: "Conversation cleared. How can I assist you with your finances today?",
        timestamp: DateTime.now(),
      ),
    );
    notifyListeners();
  }

  Future<CategorySuggestionModel?> suggestCategory(String merchant) async {
    try {
      return await _repository.suggestCategory(merchant);
    } catch (_) {
      return null;
    }
  }
}
