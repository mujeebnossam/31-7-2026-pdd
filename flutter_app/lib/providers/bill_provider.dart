import 'package:flutter/material.dart';
import '../models/bill_model.dart';
import '../repositories/bill_repository.dart';

class BillProvider with ChangeNotifier {
  final BillRepository _repository;

  List<BillModel> _bills = [];
  bool _isLoading = false;
  String? _errorMessage;

  BillProvider({BillRepository? repository}) : _repository = repository ?? BillRepository();

  List<BillModel> get bills => _bills;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  List<BillModel> get upcomingBills => _bills.where((b) => !b.isPaid && !b.isOverdue).toList();
  List<BillModel> get overdueBills => _bills.where((b) => b.isOverdue).toList();
  List<BillModel> get paidBills => _bills.where((b) => b.isPaid).toList();

  double get monthlyRecurringOutflow => _bills.where((b) => !b.isPaid).fold(0.0, (sum, b) => sum + b.amount);

  Future<void> fetchBills() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _bills = await _repository.getBills();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createBill(BillModel bill) async {
    try {
      final created = await _repository.createBill(bill);
      _bills.add(created);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateBill(String id, Map<String, dynamic> data) async {
    try {
      final updated = await _repository.updateBill(id, data);
      final index = _bills.indexWhere((b) => b.id == id);
      if (index != -1) {
        _bills[index] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<BillPayResult?> payBill(String id, {String? accountId}) async {
    try {
      final result = await _repository.payBill(id, accountId: accountId);
      final index = _bills.indexWhere((b) => b.id == id);
      if (index != -1) {
        _bills[index] = result.bill;
        notifyListeners();
      }
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> deleteBill(String id) async {
    try {
      await _repository.deleteBill(id);
      _bills.removeWhere((b) => b.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
