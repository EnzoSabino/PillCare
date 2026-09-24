import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { api } from '../services/api';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (user: any) => void;
}

export function LoginScreen({ onNavigateToRegister, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      alert('Por favor, preencha o e-mail e a senha.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/sessions', {
        email: cleanEmail,
        password: cleanPassword,
      });

      onLoginSuccess(response.data);
    } catch (error: any) {
      const serverError = error.response?.data?.error;
      const genericError = error.message || 'Erro ao realizar login. Verifique suas credenciais.';
      alert(serverError || genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* CABEÇALHO */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Feather name="heart" size={36} color="#0066CC" />
            </View>
            <Text style={styles.brandTitle}>PillCare</Text>
          </View>

          {/* FORMULÁRIO DE LOGIN */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Entrar na sua Conta</Text>

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: maria@gmail.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
              <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.6}>
                <Text style={styles.registerLink}> Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b5ecfd',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066CC',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A202C',
  },
  loginButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 13,
    color: '#718096',
  },
  registerLink: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: 'bold',
  },
});