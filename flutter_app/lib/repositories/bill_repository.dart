import '../models/bill_model.dart';
import '../services/bill_service.dart';

class BillRepository {
  final BillService _service;

  BillRepository({BillService? service}) : _service = service ?? BillService();

  Future<List<BillModel>> getBills() async {
    return await _service.getBills();
  }

  Future<BillModel> createBill(BillModel bill) async {
    return await _service.createBill(bill);
  }

  Future<BillModel> updateBill(String id, Map<String, dynamic> data) async {
    return await _service.updateBill(id, data);
  }

  Future<BillPayResult> payBill(String id, {String? accountId}) async {
    return await _service.payBill(id, accountId: accountId);
  }

  Future<void> deleteBill(String id) async {
    await _service.deleteBill(id);
  }
}
