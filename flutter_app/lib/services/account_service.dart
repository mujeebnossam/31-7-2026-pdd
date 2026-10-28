import '../core/config/api_config.dart';
import '../core/network/api_client.dart';
import '../models/account_model.dart';

class AccountService {
  final ApiClient _client;

  AccountService({ApiClient? client}) : _client = client ?? ApiClient();

  Future<List<AccountModel>> getAccounts() async {
    final res = await _client.get(ApiConfig.accounts);
    if (res is List) {
      return res.map((e) => AccountModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<AccountModel> getAccountById(String id) async {
    final res = await _client.get(ApiConfig.accountById(id));
    return AccountModel.fromJson(res as Map<String, dynamic>);
  }

  Future<AccountModel> createAccount(AccountModel account) async {
    final res = await _client.post(
      ApiConfig.accounts,
      body: account.toJson(),
    );
    return AccountModel.fromJson(res as Map<String, dynamic>);
  }

  Future<AccountModel> updateAccount(String id, Map<String, dynamic> data) async {
    final res = await _client.put(
      ApiConfig.accountById(id),
      body: data,
    );
    return AccountModel.fromJson(res as Map<String, dynamic>);
  }

  Future<void> deleteAccount(String id) async {
    await _client.delete(ApiConfig.accountById(id));
  }
}
