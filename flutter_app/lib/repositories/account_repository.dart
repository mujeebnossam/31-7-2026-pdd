import '../models/account_model.dart';
import '../services/account_service.dart';

class AccountRepository {
  final AccountService _service;

  AccountRepository({AccountService? service}) : _service = service ?? AccountService();

  Future<List<AccountModel>> getAccounts() async {
    return await _service.getAccounts();
  }

  Future<AccountModel> getAccountById(String id) async {
    return await _service.getAccountById(id);
  }

  Future<AccountModel> createAccount(AccountModel account) async {
    return await _service.createAccount(account);
  }

  Future<AccountModel> updateAccount(String id, Map<String, dynamic> data) async {
    return await _service.updateAccount(id, data);
  }

  Future<void> deleteAccount(String id) async {
    await _service.deleteAccount(id);
  }
}
