import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/ai_provider.dart';
import 'ai_anomalies_tab.dart';
import 'ai_chat_tab.dart';
import 'ai_insights_tab.dart';
import 'ai_predictions_tab.dart';

class AIHubScreen extends StatefulWidget {
  const AIHubScreen({super.key});

  @override
  State<AIHubScreen> createState() => _AIHubScreenState();
}

class _AIHubScreenState extends State<AIHubScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final aiProvider = context.watch<AIProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.auto_awesome, color: AppColors.primaryLight, size: 20),
            ),
            const SizedBox(width: 10),
            const Text('AI Intelligence Hub'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Intelligence',
            onPressed: () => aiProvider.fetchIntelligenceData(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          isScrollable: true,
          tabs: const [
            Tab(icon: Icon(Icons.chat_bubble_outline, size: 18), text: 'AI Advisor'),
            Tab(icon: Icon(Icons.lightbulb_outline, size: 18), text: 'Insights'),
            Tab(icon: Icon(Icons.trending_up, size: 18), text: 'Predictions'),
            Tab(icon: Icon(Icons.warning_amber_outlined, size: 18), text: 'Anomalies'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          AIChatTab(),
          AIInsightsTab(),
          AIPredictionsTab(),
          AIAnomaliesTab(),
        ],
      ),
    );
  }
}
