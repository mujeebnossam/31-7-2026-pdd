import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../models/ai_models.dart';
import '../../providers/ai_provider.dart';

class AIChatTab extends StatefulWidget {
  const AIChatTab({super.key});

  @override
  State<AIChatTab> createState() => _AIChatTabState();
}

class _AIChatTabState extends State<AIChatTab> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  final List<String> _quickPrompts = [
    "How much did I spend on food this month?",
    "Can I afford my upcoming bills?",
    "Why is my savings rate low?",
    "What category am I overspending on?",
    "Where can I reduce my spending?",
    "How are my goals progressing?",
  ];

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSend([String? preset]) async {
    final text = preset ?? _textController.text;
    if (text.trim().isEmpty) return;

    _textController.clear();
    final aiProvider = context.read<AIProvider>();
    _scrollToBottom();
    await aiProvider.sendChatMessage(text);
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final aiProvider = context.watch<AIProvider>();
    final messages = aiProvider.chatMessages;

    return Column(
      children: [
        // 1. Chat Header Bar with Clear Action
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: AppColors.darkSurface.withOpacity(0.5),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.lock_outline, size: 14, color: AppColors.income),
                  SizedBox(width: 6),
                  Text(
                    'Connected to Authenticated Ledger',
                    style: TextStyle(fontSize: 11, color: AppColors.textDarkSecondary, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              InkWell(
                onTap: () => aiProvider.clearChat(),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  child: Text(
                    'Clear Chat',
                    style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),

        // 2. Chat Messages Area
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            itemCount: messages.length + (aiProvider.isThinking ? 1 : 0),
            itemBuilder: (ctx, i) {
              if (i == messages.length && aiProvider.isThinking) {
                return _buildThinkingBubble();
              }
              final msg = messages[i];
              return _buildMessageBubble(msg);
            },
          ),
        ),

        // 3. Quick Prompt Suggestion Pills
        SizedBox(
          height: 38,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: _quickPrompts.length,
            itemBuilder: (ctx, i) {
              final p = _quickPrompts[i];
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: ActionChip(
                  label: Text(p, style: const TextStyle(fontSize: 11)),
                  backgroundColor: AppColors.primary.withOpacity(0.12),
                  side: BorderSide(color: AppColors.primary.withOpacity(0.3)),
                  onPressed: aiProvider.isThinking ? null : () => _handleSend(p),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),

        // 4. Input Text Box & Send Button
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).cardTheme.color,
            border: const Border(top: BorderSide(color: AppColors.darkBorder)),
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    minLines: 1,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: 'Ask Auden about your finances...',
                      filled: true,
                      fillColor: AppColors.darkBackground,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                    ),
                    onSubmitted: (_) => _handleSend(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: aiProvider.isThinking
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.arrow_upward, color: Colors.white, size: 20),
                    onPressed: aiProvider.isThinking ? null : () => _handleSend(),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMessageBubble(AIChatMessage msg) {
    final isUser = msg.isUser;
    final theme = Theme.of(context);

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : (theme.brightness == Brightness.dark ? AppColors.darkSurface : AppColors.lightCard),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: isUser ? const Radius.circular(16) : const Radius.circular(4),
            bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(16),
          ),
          border: isUser ? null : Border.all(color: AppColors.darkBorder),
        ),
        child: isUser
            ? Text(
                msg.content,
                style: const TextStyle(color: Colors.white, fontSize: 14),
              )
            : MarkdownBody(
                data: msg.content,
                styleSheet: MarkdownStyleSheet(
                  p: TextStyle(
                    color: theme.brightness == Brightness.dark ? AppColors.textDarkPrimary : AppColors.textLightPrimary,
                    fontSize: 14,
                    height: 1.4,
                  ),
                  strong: const TextStyle(fontWeight: FontWeight.bold),
                  listBullet: const TextStyle(fontSize: 14),
                ),
              ),
      ),
    );
  }

  Widget _buildThinkingBubble() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.darkBorder),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryLight),
            ),
            SizedBox(width: 10),
            Text(
              'SpendWise AI is calculating...',
              style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
