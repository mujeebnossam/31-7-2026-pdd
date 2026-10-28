import '../models/ingestion_models.dart';
import '../services/ingestion_service.dart';

class IngestionRepository {
  final IngestionService _service;

  IngestionRepository({IngestionService? service}) : _service = service ?? IngestionService();

  Future<List<DataProviderModel>> getProviders() async {
    return await _service.getProviders();
  }

  Future<CSVParseResultModel> parseCsv(String csvContent, {String? accountId}) async {
    return await _service.parseCsv(csvContent, accountId: accountId);
  }

  Future<BatchImportResultModel> confirmImport(
    List<NormalizedTransactionModel> transactions,
    String accountId, {
    bool skipDuplicates = true,
  }) async {
    return await _service.confirmImport(transactions, accountId, skipDuplicates: skipDuplicates);
  }

  Future<DemoIngestionResultModel> simulateDemo({
    String? merchant,
    double? amount,
    String? type,
    String? accountId,
    String? source,
    String? category,
  }) async {
    return await _service.simulateDemo(
      merchant: merchant,
      amount: amount,
      type: type,
      accountId: accountId,
      source: source,
      category: category,
    );
  }
}
