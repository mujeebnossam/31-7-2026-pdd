import 'package:flutter/material.dart';
import '../models/account_model.dart';
import '../repositories/account_repository.dart';

class AccountProvider with ChangeNotifier {
  final AccountRepository _repository;

  List<AccountModel> _accounts = [];
  bool _isLoading = false;
  String? _errorMessage;

  AccountProvider({AccountRepository? repository}) : _repository = repository ?? AccountRepository();

  List<AccountModel> get accounts => _accounts;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  double get totalBalance => _accounts.fold(0.0, (sum, acc) => sum + acc.balance);

  Future<void> fetchAccounts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _accounts = await _repository.getAccounts();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createAccount(AccountModel account) async {
    try {
      final created = await _repository.createAccount(account);
      _accounts.add(created);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateAccount(String id, Map<String, dynamic> data) async {
    try {
      final updated = await _repository.updateAccount(id, data);
      final index = _accounts.indexWhere((a) => a.id == id);
      if (index != -1) {
        _accounts[index] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteAccount(String id) async {
    try {
      await _repository.deleteAccount(id);
      _accounts.removeWhere((a) => a.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
