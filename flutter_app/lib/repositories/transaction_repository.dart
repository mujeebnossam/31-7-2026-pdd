import '../models/transaction_model.dart';
import '../services/transaction_service.dart';

class TransactionRepository {
  final TransactionService _service;

  TransactionRepository({TransactionService? service}) : _service = service ?? TransactionService();

  Future<List<TransactionModel>> getTransactions({
    String? type,
    String? category,
    String? accountId,
    int limit = 100,
    int offset = 0,
  }) async {
    return await _service.getTransactions(
      type: type,
      category: category,
      accountId: accountId,
      limit: limit,
      offset: offset,
    );
  }

  Future<TransactionModel> createTransaction(TransactionModel transaction) async {
    return await _service.createTransaction(transaction);
  }

  Future<TransactionModel> updateTransaction(String id, Map<String, dynamic> data) async {
    return await _service.updateTransaction(id, data);
  }

  Future<void> deleteTransaction(String id) async {
    await _service.deleteTransaction(id);
  }
}
