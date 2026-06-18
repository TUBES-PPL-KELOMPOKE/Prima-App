export interface User {
  id: string;
  name: string;
  email: string;
  role: 'pasien' | 'dokter' | 'admin';
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
