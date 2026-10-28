import '../core/config/api_config.dart';
import '../core/network/api_client.dart';
import '../models/ingestion_models.dart';

class IngestionService {
  final ApiClient _client;

  IngestionService({ApiClient? client}) : _client = client ?? ApiClient();

  Future<List<DataProviderModel>> getProviders() async {
    final res = await _client.get(ApiConfig.ingestionProviders);
    if (res is List) {
      return res.map((e) => DataProviderModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<CSVParseResultModel> parseCsv(String csvContent, {String? accountId}) async {
    final res = await _client.post(
      ApiConfig.ingestionCsvParse,
      body: {
        'csvContent': csvContent,
        if (accountId != null) 'accountId': accountId,
      },
    );
    return CSVParseResultModel.fromJson(res as Map<String, dynamic>);
  }

  Future<BatchImportResultModel> confirmImport(
    List<NormalizedTransactionModel> transactions,
    String accountId, {
    bool skipDuplicates = true,
  }) async {
    final res = await _client.post(
      ApiConfig.ingestionCsvConfirm,
      body: {
        'transactions': transactions.map((t) => t.toJson()).toList(),
        'accountId': accountId,
        'skipDuplicates': skipDuplicates,
      },
    );
    return BatchImportResultModel.fromJson(res as Map<String, dynamic>);
  }

  Future<DemoIngestionResultModel> simulateDemo({
    String? merchant,
    double? amount,
    String? type,
    String? accountId,
    String? source,
    String? category,
  }) async {
    final res = await _client.post(
      ApiConfig.ingestionDemo,
      body: {
        if (merchant != null) 'merchant': merchant,
        if (amount != null) 'amount': amount,
        if (type != null) 'type': type,
        if (accountId != null) 'accountId': accountId,
        if (source != null) 'source': source,
        if (category != null) 'category': category,
      },
    );
    return DemoIngestionResultModel.fromJson(res as Map<String, dynamic>);
  }
}
