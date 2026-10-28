import '../core/config/api_config.dart';
import '../core/network/api_client.dart';
import '../models/bill_model.dart';

class BillService {
  final ApiClient _client;

  BillService({ApiClient? client}) : _client = client ?? ApiClient();

  Future<List<BillModel>> getBills() async {
    final res = await _client.get(ApiConfig.bills);
    if (res is List) {
      return res.map((e) => BillModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<BillModel> createBill(BillModel bill) async {
    final res = await _client.post(
      ApiConfig.bills,
      body: bill.toJson(),
    );
    return BillModel.fromJson(res as Map<String, dynamic>);
  }

  Future<BillModel> updateBill(String id, Map<String, dynamic> data) async {
    final res = await _client.put(
      ApiConfig.billById(id),
      body: data,
    );
    return BillModel.fromJson(res as Map<String, dynamic>);
  }

  Future<BillPayResult> payBill(String id, {String? accountId}) async {
    final res = await _client.post(
      ApiConfig.billPay(id),
      body: {
        if (accountId != null) 'accountId': accountId,
      },
    );
    return BillPayResult.fromJson(res as Map<String, dynamic>);
  }

  Future<void> deleteBill(String id) async {
    await _client.delete(ApiConfig.billById(id));
  }
}
