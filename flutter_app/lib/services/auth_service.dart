import '../core/config/api_config.dart';
import '../core/network/api_client.dart';
import '../models/user_model.dart';

class AuthService {
  final ApiClient _client;

  AuthService({ApiClient? client}) : _client = client ?? ApiClient();

  Future<AuthResponse> register(String name, String email, String password) async {
    final res = await _client.post(
      ApiConfig.authRegister,
      body: {'name': name, 'email': email, 'password': password},
    );
    return AuthResponse.fromJson(res as Map<String, dynamic>);
  }

  Future<AuthResponse> login(String email, String password) async {
    final res = await _client.post(
      ApiConfig.authLogin,
      body: {'email': email, 'password': password},
    );
    return AuthResponse.fromJson(res as Map<String, dynamic>);
  }

  Future<UserModel> getMe() async {
    final res = await _client.get(ApiConfig.authMe);
    return UserModel.fromJson(res as Map<String, dynamic>);
  }

  Future<void> deleteAccount() async {
    await _client.delete(ApiConfig.authAccount);
  }
}
