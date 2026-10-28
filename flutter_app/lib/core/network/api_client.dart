import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../storage/secure_storage_service.dart';
import 'api_exceptions.dart';

class ApiClient {
  final http.Client _httpClient;
  final SecureStorageService _storageService;
  
  // Callback when 401 Unauthorized occurs across any endpoint
  void Function()? onUnauthorized;

  ApiClient({
    http.Client? httpClient,
    SecureStorageService? storageService,
    this.onUnauthorized,
  })  : _httpClient = httpClient ?? http.Client(),
        _storageService = storageService ?? SecureStorageService();

  Future<Map<String, String>> _buildHeaders([Map<String, String>? customHeaders]) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final token = await _storageService.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    if (customHeaders != null) {
      headers.addAll(customHeaders);
    }

    return headers;
  }

  dynamic _handleResponse(http.Response response) {
    dynamic responseData;
    try {
      if (response.body.isNotEmpty) {
        responseData = jsonDecode(response.body);
      }
    } catch (_) {
      responseData = null;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return responseData;
    }

    if (response.statusCode == 401) {
      onUnauthorized?.call();
      throw UnauthorizedException(
        responseData is Map && responseData['error'] != null
            ? responseData['error']
            : 'Unauthorized session expired.',
      );
    }

    final errorMessage = (responseData is Map && responseData['error'] != null)
        ? responseData['error'].toString()
        : 'Request failed with status code ${response.statusCode}';

    throw ApiException(errorMessage, statusCode: response.statusCode, data: responseData);
  }

  Future<dynamic> get(String url, {Map<String, String>? headers, Map<String, dynamic>? queryParams}) async {
    try {
      Uri uri = Uri.parse(url);
      if (queryParams != null && queryParams.isNotEmpty) {
        uri = uri.replace(queryParameters: queryParams.map((k, v) => MapEntry(k, v.toString())));
      }

      final requestHeaders = await _buildHeaders(headers);
      final response = await _httpClient
          .get(uri, headers: requestHeaders)
          .timeout(ApiConfig.connectTimeout);

      return _handleResponse(response);
    } on SocketException catch (_) {
      throw NetworkException();
    } on HttpException catch (_) {
      throw NetworkException();
    } on FormatException catch (_) {
      throw ApiException('Malformed response received from server.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw NetworkException(e.toString());
    }
  }

  Future<dynamic> post(String url, {dynamic body, Map<String, String>? headers}) async {
    try {
      final uri = Uri.parse(url);
      final requestHeaders = await _buildHeaders(headers);
      final encodedBody = body != null ? jsonEncode(body) : null;

      final response = await _httpClient
          .post(uri, headers: requestHeaders, body: encodedBody)
          .timeout(ApiConfig.connectTimeout);

      return _handleResponse(response);
    } on SocketException catch (_) {
      throw NetworkException();
    } on HttpException catch (_) {
      throw NetworkException();
    } catch (e) {
      if (e is ApiException) rethrow;
      throw NetworkException(e.toString());
    }
  }

  Future<dynamic> put(String url, {dynamic body, Map<String, String>? headers}) async {
    try {
      final uri = Uri.parse(url);
      final requestHeaders = await _buildHeaders(headers);
      final encodedBody = body != null ? jsonEncode(body) : null;

      final response = await _httpClient
          .put(uri, headers: requestHeaders, body: encodedBody)
          .timeout(ApiConfig.connectTimeout);

      return _handleResponse(response);
    } on SocketException catch (_) {
      throw NetworkException();
    } on HttpException catch (_) {
      throw NetworkException();
    } catch (e) {
      if (e is ApiException) rethrow;
      throw NetworkException(e.toString());
    }
  }

  Future<dynamic> delete(String url, {dynamic body, Map<String, String>? headers}) async {
    try {
      final uri = Uri.parse(url);
      final requestHeaders = await _buildHeaders(headers);
      final encodedBody = body != null ? jsonEncode(body) : null;

      final response = await _httpClient
          .delete(uri, headers: requestHeaders, body: encodedBody)
          .timeout(ApiConfig.connectTimeout);

      return _handleResponse(response);
    } on SocketException catch (_) {
      throw NetworkException();
    } on HttpException catch (_) {
      throw NetworkException();
    } catch (e) {
      if (e is ApiException) rethrow;
      throw NetworkException(e.toString());
    }
  }
}
