class UserModel {
  final String id;
  final String name;
  final String email;
  final int financialScore;
  final String memberSince;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.financialScore = 720,
    this.memberSince = '',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'User',
      email: json['email']?.toString() ?? '',
      financialScore: json['financialScore'] != null
          ? int.tryParse(json['financialScore'].toString()) ?? 720
          : 720,
      memberSince: json['memberSince']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'financialScore': financialScore,
      'memberSince': memberSince,
    };
  }
}

class AuthResponse {
  final String token;
  final UserModel user;

  AuthResponse({required this.token, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token']?.toString() ?? '',
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
