import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FinancialAnalysisService } from '../services/financialAnalysisService';
import { PredictionService } from '../services/predictionService';
import { AIInsightEngine } from '../services/aiInsightEngine';
import { AIAdvisorService, ChatMessage } from '../services/aiAdvisorService';
import { AIConversation } from '../models/AIConversation';
import { AIMessage } from '../models/AIMessage';

// GET /api/ai/summary
export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const summary = await FinancialAnalysisService.getFinancialSummary(req.userId!);
    res.json(summary);
  } catch (err: any) {
    console.error('getSummary error:', err.message);
    res.status(500).json({ error: 'Failed to generate financial summary' });
  }
};

// GET /api/ai/insights
export const getInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const summary = await FinancialAnalysisService.getFinancialSummary(req.userId!);
    const predictions = await PredictionService.getFinancialPredictions(req.userId!, summary);
    const insights = AIInsightEngine.generateFinancialInsights(summary, predictions);
    res.json(insights);
  } catch (err: any) {
    console.error('getInsights error:', err.message);
    res.status(500).json({ error: 'Failed to generate financial insights' });
  }
};

// GET /api/ai/predictions
export const getPredictions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const predictions = await PredictionService.getFinancialPredictions(req.userId!);
    res.json(predictions);
  } catch (err: any) {
    console.error('getPredictions error:', err.message);
    res.status(500).json({ error: 'Failed to generate financial predictions' });
  }
};

// POST /api/ai/chat
export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, conversationId } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const userId = req.userId!;

    // Find or create conversation
    let conv: AIConversation | null = null;
    if (conversationId) {
      conv = await AIConversation.findOne({ where: { id: conversationId, userId } });
    }

    if (!conv) {
      conv = await AIConversation.create({
        userId,
        title: prompt.slice(0, 40) || 'Financial Advisory Session',
      });
    }

    // Record user message
    await AIMessage.create({
      conversationId: conv.id,
      userId,
      role: 'user',
      content: prompt.trim(),
    });

    // Load recent history
    const pastMessages = await AIMessage.findAll({
      where: { conversationId: conv.id, userId },
      order: [['createdAt', 'ASC']],
      limit: 10,
    });

    const history: ChatMessage[] = pastMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Generate intelligent financial response
    const advisorResponse = await AIAdvisorService.generateAdvisorResponse(userId, prompt.trim(), history);

    // Save assistant response
    const savedAiMsg = await AIMessage.create({
      conversationId: conv.id,
      userId,
      role: 'assistant',
      content: advisorResponse,
    });

    res.json({
      response: advisorResponse,
      conversationId: conv.id,
      messageId: savedAiMsg.id,
    });
  } catch (err: any) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ error: 'AI advisor failed to generate response' });
  }
};

// GET /api/ai/conversations
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await AIConversation.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: AIMessage,
          as: 'messages',
        },
      ],
      order: [['updatedAt', 'DESC']],
    });
    res.json(conversations);
  } catch (err: any) {
    console.error('getConversations error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
};

// DELETE /api/ai/conversations
export const clearConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    await AIMessage.destroy({ where: { userId } });
    await AIConversation.destroy({ where: { userId } });
    res.json({ message: 'Conversation history cleared successfully' });
  } catch (err: any) {
    console.error('clearConversations error:', err.message);
    res.status(500).json({ error: 'Failed to clear conversations' });
  }
};

// POST /api/ai/suggest-category
export const suggestCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { merchant } = req.body;
    const suggestion = AIAdvisorService.suggestCategory(merchant || '');
    res.json(suggestion);
  } catch (err: any) {
    console.error('suggestCategory error:', err.message);
    res.status(500).json({ error: 'Failed to suggest category' });
  }
};
