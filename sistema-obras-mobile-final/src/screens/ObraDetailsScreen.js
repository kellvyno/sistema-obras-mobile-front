import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
  TouchableOpacity, Image, Modal, TextInput, Linking // Importa Modal e TextInput para o email
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getObraById, deleteObra, getFiscalizacoesByObra, sendObraEmail } from '../api/obras';

const ObraDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { obraId } = route.params;

  const [obra, setObra] = useState(null);
  const [fiscalizacoes, setFiscalizacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');

  const fetchObraData = async () => {
    try {
      setLoading(true);
      const obraResponse = await getObraById(obraId);
      setObra(obraResponse.data.data);

      const fiscResponse = await getFiscalizacoesByObra(obraId);
      setFiscalizacoes(fiscResponse.data.data); // Ajuste conforme a estrutura da sua resposta

      setError(null);
    } catch (err) {
      console.error('Erro ao buscar detalhes da obra:', err.response?.data || err.message);
      setError('Não foi possível carregar os detalhes da obra. Verifique a conexão.');
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da obra.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchObraData();
    }, [obraId])
  );

  const handleDeleteObra = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta obra e todas as suas fiscalizações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteObra(obraId);
              Alert.alert('Sucesso', 'Obra excluída com sucesso!');
              navigation.goBack(); // Volta para a tela Home
            } catch (err) {
              console.error('Erro ao excluir obra:', err.response?.data || err.message);
              Alert.alert('Erro', `Não foi possível excluir a obra: ${err.response?.data?.message || err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSendEmail = async () => {
    if (!emailRecipient.trim()) {
      Alert.alert('Erro', 'Por favor, insira um endereço de e-mail válido.');
      return;
    }
    setIsSendingEmail(true);
    try {
      await sendObraEmail(obraId, emailRecipient);
      Alert.alert('Sucesso', `Detalhes da obra enviados para ${emailRecipient}.`);
      setEmailModalVisible(false);
      setEmailRecipient('');
    } catch (err) {
      console.error('Erro ao enviar email:', err.response?.data || err.message);
      Alert.alert('Erro', `Não foi possível enviar o e-mail: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loading || !obra) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando detalhes da obra...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchObraData}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{obra.nome}</Text>

      {obra.foto && (
        <Image source={{ uri: obra.foto }} style={styles.obraImage} />
      )}

      <View style={styles.infoSection}>
        <Text style={styles.label}>Responsável:</Text>
        <Text style={styles.value}>{obra.responsavel}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{obra.status}</Text>

        <Text style={styles.label}>Período:</Text>
        <Text style={styles.value}>
          {new Date(obra.dataInicio).toLocaleDateString()} a{' '}
          {new Date(obra.dataFim).toLocaleDateString()}
        </Text>

        <Text style={styles.label}>Descrição:</Text>
        <Text style={styles.value}>{obra.descricao}</Text>

        <Text style={styles.label}>Localização:</Text>
        <Text style={styles.value}>
          Latitude: {obra.localizacao.latitude}, Longitude: {obra.localizacao.longitude}
        </Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
            // Abre no Google Maps ou similar
            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
            const latLng = `${obra.localizacao.latitude},${obra.localizacao.longitude}`;
            const label = 'Local da Obra';
            const url = Platform.select({
              ios: `${scheme}${label}@${latLng}`,
              android: `${scheme}${latLng}(${label})`
            });
            Linking.openURL(url);
          }}
        >
          <Text style={styles.mapButtonText}>Ver no Mapa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('ObraForm', { obraId: obra._id })}
        >
          <Text style={styles.buttonText}>Editar Obra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteObra}
        >
          <Text style={styles.buttonText}>Excluir Obra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.emailButton]}
          onPress={() => setEmailModalVisible(true)}
        >
          <Text style={styles.buttonText}>Enviar E-mail</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fiscalizacoesTitle}>Fiscalizações:</Text>
      {fiscalizacoes.length === 0 ? (
        <Text style={styles.noFiscalizacoesText}>Nenhuma fiscalização para esta obra ainda.</Text>
      ) : (
        fiscalizacoes.map((fisc) => (
          <TouchableOpacity // << Mude View para TouchableOpacity
            key={fisc._id}
            style={styles.fiscalizacaoItem}
            onPress={() => navigation.navigate('FiscalizacaoDetails', { fiscalizacaoId: fisc._id })} // << Adicione esta linha
          >
            <Text style={styles.fiscalizacaoDate}>Data: {new Date(fisc.data).toLocaleDateString()}</Text>
            <Text>Status: {fisc.status}</Text>
            <Text>Observações: {fisc.observacoes}</Text>
            {fisc.foto && <Image source={{ uri: fisc.foto }} style={styles.fiscalizacaoImage} />}
          </TouchableOpacity> // << Mude View para TouchableOpacity
        ))
      )}

      <TouchableOpacity
        style={styles.addFiscalizacaoButton}
        onPress={() => navigation.navigate('FiscalizacaoForm', { obraId: obra._id })}
      >
        <Text style={styles.buttonText}>Adicionar Nova Fiscalização</Text>
      </TouchableOpacity>

      {/* Modal de Envio de Email */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={emailModalVisible}
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enviar Detalhes da Obra por E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="E-mail do destinatário"
              keyboardType="email-address"
              value={emailRecipient}
              onChangeText={setEmailRecipient}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEmailModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSendButton]}
                onPress={handleSendEmail}
                disabled={isSendingEmail}
              >
                <Text style={styles.buttonText}>{isSendingEmail ? 'Enviando...' : 'Enviar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  obraImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555',
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  mapButton: {
    backgroundColor: '#6c757d',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    flexWrap: 'wrap', // Permite que os botões quebrem a linha
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1, // Faz com que os botões ocupem o espaço disponível
    marginHorizontal: 5,
    minWidth: 120, // Largura mínima para botões
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#ffc107', // Amarelo
  },
  deleteButton: {
    backgroundColor: '#dc3545', // Vermelho
  },
  emailButton: {
    backgroundColor: '#17a2b8', // Azul-claro
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fiscalizacoesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  fiscalizacaoItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
  },
  fiscalizacaoDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fiscalizacaoImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  noFiscalizacoesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  addFiscalizacaoButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30, // Espaço extra no final
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  // Estilos para o Modal de Email
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
  },
  modalSendButton: {
    backgroundColor: '#28a745',
  },
});

export default ObraDetailsScreen;