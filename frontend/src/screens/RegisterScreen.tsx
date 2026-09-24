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

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export function RegisterScreen({ onNavigateToLogin, onRegisterSuccess }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);

      await api.post('/users', {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
      });

      alert('Conta criada com sucesso! Agora você pode fazer login.');
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else if (onNavigateToLogin) {
        onNavigateToLogin();
      }
    } catch (error: any) {
      const serverError = error.response?.data?.error;
      const genericError = error.message || 'Não foi possível realizar o cadastro.';
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
          
          {/* CABEÇALHO DA MARCA COM NOME, LOGO E DESCRIÇÃO BREVE */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Feather name="heart" size={36} color="#0066CC" />
            </View>
            <Text style={styles.brandTitle}>PillCare</Text>
            <Text style={styles.brandSubtitle}>
              Seu assistente pessoal para gestão de medicamentos, controle de quantidade e histórico de doses.
            </Text>
          </View>

          {/* FORMULÁRIO DE CADASTRO */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Criar Nova Conta</Text>

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Maria Silva"
              placeholderTextColor="#A0AEC0"
              value={name}
              onChangeText={setName}
            />

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
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerButtonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.6}>
                <Text style={styles.loginLink}> Entrar</Text>
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

  // Branding Header
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
  brandSubtitle: {
    fontSize: 13,
    color: '#2B6CB0',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 18,
  },

  // Card Form
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
  registerButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 13,
    color: '#718096',
  },
  loginLink: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: 'bold',
  },
});