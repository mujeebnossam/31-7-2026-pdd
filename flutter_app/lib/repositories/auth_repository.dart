import '../core/storage/secure_storage_service.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthRepository {
  final AuthService _authService;
  final SecureStorageService _storageService;

  AuthRepository({
    AuthService? authService,
    SecureStorageService? storageService,
  })  : _authService = authService ?? AuthService(),
        _storageService = storageService ?? SecureStorageService();

  Future<AuthResponse> register(String name, String email, String password) async {
    final response = await _authService.register(name, email, password);
    await _storageService.saveToken(response.token);
    return response;
  }

  Future<AuthResponse> login(String email, String password) async {
    final response = await _authService.login(email, password);
    await _storageService.saveToken(response.token);
    return response;
  }

  Future<UserModel> getMe() async {
    return await _authService.getMe();
  }

  Future<String?> getToken() async {
    return await _storageService.getToken();
  }

  Future<void> logout() async {
    await _storageService.clearAll();
  }

  Future<void> deleteAccount() async {
    await _authService.deleteAccount();
    await _storageService.clearAll();
  }
}
