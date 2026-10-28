import 'package:flutter/material.dart';
import '../models/ingestion_models.dart';
import '../repositories/ingestion_repository.dart';

class IngestionProvider with ChangeNotifier {
  final IngestionRepository _repository;

  List<DataProviderModel> _providers = [];
  CSVParseResultModel? _parseResult;
  BatchImportResultModel? _importResult;
  DemoIngestionResultModel? _demoResult;

  bool _isParsing = false;
  bool _isImporting = false;
  bool _isSimulatingDemo = false;
  String? _errorMessage;

  IngestionProvider({IngestionRepository? repository})
      : _repository = repository ?? IngestionRepository();

  List<DataProviderModel> get providers => _providers;
  CSVParseResultModel? get parseResult => _parseResult;
  BatchImportResultModel? get importResult => _importResult;
  DemoIngestionResultModel? get demoResult => _demoResult;

  bool get isParsing => _isParsing;
  bool get isImporting => _isImporting;
  bool get isSimulatingDemo => _isSimulatingDemo;
  String? get errorMessage => _errorMessage;

  Future<void> fetchProviders() async {
    try {
      _providers = await _repository.getProviders();
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<bool> parseCsv(String csvContent, {String? accountId}) async {
    _isParsing = true;
    _errorMessage = null;
    _parseResult = null;
    notifyListeners();

    try {
      _parseResult = await _repository.parseCsv(csvContent, accountId: accountId);
      _isParsing = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isParsing = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> confirmImport(String accountId, {bool skipDuplicates = true}) async {
    if (_parseResult == null || _parseResult!.rows.isEmpty) return false;

    _isImporting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _importResult = await _repository.confirmImport(
        _parseResult!.rows,
        accountId,
        skipDuplicates: skipDuplicates,
      );
      _isImporting = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isImporting = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> simulateDemo({
    String? merchant,
    double? amount,
    String? type,
    String? accountId,
    String? source,
    String? category,
  }) async {
    _isSimulatingDemo = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _demoResult = await _repository.simulateDemo(
        merchant: merchant,
        amount: amount,
        type: type,
        accountId: accountId,
        source: source,
        category: category,
      );
      _isSimulatingDemo = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isSimulatingDemo = false;
      notifyListeners();
      return false;
    }
  }

  void clearResults() {
    _parseResult = null;
    _importResult = null;
    _demoResult = null;
    _errorMessage = null;
    notifyListeners();
  }
}
