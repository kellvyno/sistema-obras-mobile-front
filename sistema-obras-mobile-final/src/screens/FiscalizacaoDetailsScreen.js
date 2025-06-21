import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
  TouchableOpacity, Image, Platform, Linking
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getFiscalizacaoById, deleteFiscalizacao } from '../api/fiscalizacoes';

const FiscalizacaoDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { fiscalizacaoId } = route.params;

  const [fiscalizacao, setFiscalizacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiscalizacaoData = async () => {
    try {
      setLoading(true);
      const response = await getFiscalizacaoById(fiscalizacaoId);
      setFiscalizacao(response.data.data); // Ajuste conforme a estrutura da sua resposta da API
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar detalhes da fiscalização:', err.response?.data || err.message);
      setError('Não foi possível carregar os detalhes da fiscalização. Verifique a conexão.');
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da fiscalização.');
    } finally {
      setLoading(false);
    }
  };

  // Usa useFocusEffect para recarregar os dados sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      fetchFiscalizacaoData();
    }, [fiscalizacaoId])
  );

  const handleDeleteFiscalizacao = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta fiscalização?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteFiscalizacao(fiscalizacaoId);
              Alert.alert('Sucesso', 'Fiscalização excluída com sucesso!');
              navigation.goBack(); // Volta para a tela ObraDetails
            } catch (err) {
              console.error('Erro ao excluir fiscalização:', err.response?.data || err.message);
              Alert.alert('Erro', `Não foi possível excluir a fiscalização: ${err.response?.data?.message || err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading || !fiscalizacao) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando detalhes da fiscalização...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFiscalizacaoData}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalhes da Fiscalização</Text>

      {fiscalizacao.foto && (
        <Image source={{ uri: fiscalizacao.foto }} style={styles.fiscalizacaoImage} />
      )}

      <View style={styles.infoSection}>
        <Text style={styles.label}>Obra Relacionada:</Text>
        <Text style={styles.value}>{fiscalizacao.obra.nome || fiscalizacao.obra}</Text>
        {/* Você pode querer mostrar o nome da obra aqui, se o backend populou a referência */}

        <Text style={styles.label}>Data da Fiscalização:</Text>
        <Text style={styles.value}>{new Date(fiscalizacao.data).toLocaleDateString()}</Text>

        <Text style={styles.label}>Fiscal:</Text>
        <Text style={styles.value}>{fiscalizacao.fiscal}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{fiscalizacao.status}</Text>

        <Text style={styles.label}>Observações:</Text>
        <Text style={styles.value}>{fiscalizacao.observacoes}</Text>

        <Text style={styles.label}>Localização:</Text>
        <Text style={styles.value}>
          Latitude: {fiscalizacao.localizacao.latitude}, Longitude: {fiscalizacao.localizacao.longitude}
        </Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
            const latLng = `${fiscalizacao.localizacao.latitude},${fiscalizacao.localizacao.longitude}`;
            const label = 'Local da Fiscalização';
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
          onPress={() => navigation.navigate('FiscalizacaoForm', { fiscalizacaoId: fiscalizacao._id, obraId: fiscalizacao.obra._id || fiscalizacao.obra })}
        >
          <Text style={styles.buttonText}>Editar Fiscalização</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteFiscalizacao}
        >
          <Text style={styles.buttonText}>Excluir Fiscalização</Text>
        </TouchableOpacity>
      </View>
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
  fiscalizacaoImage: {
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
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    minWidth: 120,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
});

export default FiscalizacaoDetailsScreen;