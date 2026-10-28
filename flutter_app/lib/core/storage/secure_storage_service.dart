import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const String _tokenKey = 'sw_jwt_token';
  static const String _userCacheKey = 'sw_user_cache';
  static const String _baseUrlKey = 'sw_base_url';

  final FlutterSecureStorage _storage;

  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
              ),
            );

  // JWT Token Management
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  // Base URL override management
  Future<void> saveBaseUrl(String url) async {
    await _storage.write(key: _baseUrlKey, value: url);
  }

  Future<String?> getBaseUrl() async {
    return await _storage.read(key: _baseUrlKey);
  }

  // Clear all sensitive credentials on logout
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
