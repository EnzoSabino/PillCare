import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface DoseHistoryItem {
  id: string;
  takenAt: string;
  medication: {
    name: string;
    dosage: string;
  };
}

interface HomeScreenProps {
  user: User;
  onLogout: () => void;
}

export function HomeScreen({ user, onLogout }: HomeScreenProps) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Cadastro
  const [modalVisible, setModalVisible] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState('');
  const [threshold, setThreshold] = useState('');
  const [frequency, setFrequency] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados do Modal de Histórico
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyList, setHistoryList] = useState<DoseHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function fetchMedications() {
    try {
      setLoading(true);
      const response = await api.get(`/users/${user.id}/medications`);
      setMedications(response.data);
    } catch (error) {
      alert('Não foi possível carregar os medicamentos.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/users/${user.id}/history`);
      setHistoryList(response.data);
    } catch (error) {
      alert('Não foi possível carregar o histórico de doses.');
    } finally {
      setLoadingHistory(false);
    }
  }

  function handleOpenHistory() {
    setHistoryModalVisible(true);
    fetchHistory();
  }

  async function handleTakeDose(id: string, currentStock: number) {
    if (currentStock <= 0) {
      alert('Atenção: Este medicamento está sem estoque!');
      return;
    }

    try {
      await api.patch(`/medications/${id}/take`);
      fetchMedications();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao registrar a dose.');
    }
  }

  async function handleDeleteMedication(id: string) {
    try {
      await api.delete(`/medications/${id}`);
      fetchMedications();
    } catch (error) {
      alert('Erro ao excluir medicamento.');
    }
  }

  async function handleAddMedication() {
    const cleanName = medName.trim();
    const cleanDosage = dosage.trim();
    const cleanInstructions = instructions.trim();
    const parsedQuantity = Number(quantity);
    const parsedThreshold = Number(threshold) || 5;
    const parsedFrequency = Number(frequency) || 8;

    if (!cleanName || !cleanDosage || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      alert('Por favor, preencha o Nome, Dosagem e uma Quantidade válida.');
      return;
    }

    const fullDosage = cleanInstructions
      ? `${cleanDosage} - ${cleanInstructions}`
      : cleanDosage;

    try {
      setSaving(true);

      await api.post(`/users/${user.id}/medications`, {
        name: cleanName,
        dosage: fullDosage,
        quantityInStock: parsedQuantity,
        refillThreshold: parsedThreshold,
        frequencyHours: parsedFrequency,
      });

      alert('Medicamento cadastrado com sucesso!');

      setModalVisible(false);

      setMedName('');
      setDosage('');
      setInstructions('');
      setQuantity('');
      setThreshold('');
      setFrequency('');

      fetchMedications();
    } catch (error: any) {
      const serverError = error.response?.data?.error;
      const genericError = error.message || 'Erro ao comunicar com o servidor.';

      alert(serverError || genericError);
    } finally {
      setSaving(false);
    }
  }

  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. APENAS LOGO E NOME PILLCARE */}
      <View style={styles.appHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoIcon}>
            <Feather name="heart" size={22} color="#FFF" />
          </View>
          <Text style={styles.appName}>PillCare</Text>
        </View>
      </View>

      {/* 2. BARRA DO USUÁRIO & AÇÕES */}
      <View style={styles.userBar}>
        <View>
          <Text style={styles.greeting}>Olá, {user.name} 👋</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.historyIconButton} onPress={handleOpenHistory}>
            <Feather name="clock" size={18} color="#0066CC" />
            <Text style={styles.historyButtonText}>Histórico</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Feather name="log-out" size={16} color="#E53E3E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Seus Medicamentos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={medications}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Feather name="file-text" size={32} color="#CBD5E0" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>Você ainda não tem medicamentos cadastrados.</Text>
                <Text style={styles.emptySubtext}>Clique no botão "+ Adicionar" para começar.</Text>
              </View>
            }
            renderItem={({ item }: any) => {
              const isLowStock = item.quantityInStock <= item.refillThreshold;

              return (
                <View style={[styles.card, isLowStock && styles.cardLowStock]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medName}>{item.name}</Text>
                      <Text style={styles.dosage}>{item.dosage}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteMedication(item.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.6}
                    >
                      <Feather name="trash-2" size={18} color="#E53E3E" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={[styles.stock, isLowStock && styles.stockLowText]}>
                        Quantidade: {item.quantityInStock} un. {isLowStock ? '⚠️ (Baixa)' : ''}
                      </Text>
                      <Text style={styles.freqText}>Intervalo: De {item.frequencyHours || 8}h em {item.frequencyHours || 8}h</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.takeButton}
                      onPress={() => handleTakeDose(item.id, item.quantityInStock)}
                    >
                      <Text style={styles.takeButtonText}>✓ Tomei</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Modal de Cadastro */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Informações do Medicamento</Text>

            <Text style={styles.label}>Nome do Medicamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Paracetamol"
              placeholderTextColor="#A0AEC0"
              value={medName}
              onChangeText={setMedName}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>Dosagem</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 500mg"
                  placeholderTextColor="#A0AEC0"
                  value={dosage}
                  onChangeText={setDosage}
                />
              </View>

              <View style={{ flex: 1.5, marginLeft: 6 }}>
                <Text style={styles.label}>Instruções / Uso</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Com água após refeição"
                  placeholderTextColor="#A0AEC0"
                  value={instructions}
                  onChangeText={setInstructions}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>Quantidade na Caixa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 20"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={{ flex: 1, marginHorizontal: 3 }}>
                <Text style={styles.label}>Intervalo (Horas)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 8"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  value={frequency}
                  onChangeText={setFrequency}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.label}>Alerta Mín.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 5"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  value={threshold}
                  onChangeText={setThreshold}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddMedication}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveText}>Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Histórico de Doses */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '80%' }]}>
            <View style={styles.historyModalHeader}>
              <Text style={styles.modalTitle}>Histórico de Doses</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Feather name="x" size={24} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {loadingHistory ? (
              <ActivityIndicator size="large" color="#0066CC" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={historyList}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#718096' }}>Nenhuma dose registrada ainda.</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View>
                      <Text style={styles.historyMedName}>
                        {item.medication?.name || 'Medicamento removido'}
                      </Text>
                      <Text style={styles.historyDosage}>{item.medication?.dosage}</Text>
                    </View>
                    <Text style={styles.historyDate}>{formatDate(item.takenAt)}</Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b5ecfd' },
  appHeader: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  userBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  greeting: { fontSize: 16, fontWeight: 'bold', color: '#1A202C' },
  email: { fontSize: 12, color: '#718096' },
  historyIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    marginRight: 8,
  },
  historyButtonText: {
    color: '#0066CC',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  addButton: { backgroundColor: '#0066CC', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  emptyCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  emptyText: { color: '#2D3748', fontWeight: '600' },
  emptySubtext: { color: '#A0AEC0', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardLowStock: { borderColor: '#E53E3E', backgroundColor: '#FFF5F5' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medName: { fontSize: 16, fontWeight: 'bold', color: '#0066CC' },
  dosage: { fontSize: 13, color: '#4A5568', marginTop: 2 },
  deleteButton: { padding: 6, backgroundColor: '#FFF5F5', borderRadius: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  stock: { fontSize: 13, fontWeight: '600', color: '#2D3748' },
  stockLowText: { color: '#E53E3E' },
  freqText: { fontSize: 12, color: '#718096', marginTop: 2 },
  takeButton: { backgroundColor: '#38A169', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  takeButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1D20', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#4A5568', marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1A202C',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, marginLeft: 10 },
  cancelButton: { backgroundColor: '#EDF2F7' },
  cancelText: { color: '#4A5568', fontWeight: '600' },
  saveButton: { backgroundColor: '#0066CC' },
  saveText: { color: '#FFF', fontWeight: 'bold' },
  historyModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  historyMedName: { fontSize: 14, fontWeight: 'bold', color: '#2D3748' },
  historyDosage: { fontSize: 12, color: '#718096' },
  historyDate: { fontSize: 12, color: '#0066CC', fontWeight: '600' },
});