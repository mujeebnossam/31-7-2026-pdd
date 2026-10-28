import '../core/config/api_config.dart';
import '../core/network/api_client.dart';
import '../models/transaction_model.dart';

class TransactionService {
  final ApiClient _client;

  TransactionService({ApiClient? client}) : _client = client ?? ApiClient();

  Future<List<TransactionModel>> getTransactions({
    String? type,
    String? category,
    String? accountId,
    int limit = 100,
    int offset = 0,
  }) async {
    final queryParams = <String, dynamic>{
      'limit': limit,
      'offset': offset,
    };
    if (type != null && type.isNotEmpty && type != 'all') queryParams['type'] = type;
    if (category != null && category.isNotEmpty && category != 'All') queryParams['category'] = category;
    if (accountId != null && accountId.isNotEmpty) queryParams['accountId'] = accountId;

    final res = await _client.get(ApiConfig.transactions, queryParams: queryParams);
    if (res is List) {
      return res.map((e) => TransactionModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<TransactionModel> createTransaction(TransactionModel transaction) async {
    final res = await _client.post(
      ApiConfig.transactions,
      body: transaction.toJson(),
    );
    return TransactionModel.fromJson(res as Map<String, dynamic>);
  }

  Future<TransactionModel> updateTransaction(String id, Map<String, dynamic> data) async {
    final res = await _client.put(
      ApiConfig.transactionById(id),
      body: data,
    );
    return TransactionModel.fromJson(res as Map<String, dynamic>);
  }

  Future<void> deleteTransaction(String id) async {
    await _client.delete(ApiConfig.transactionById(id));
  }
}
