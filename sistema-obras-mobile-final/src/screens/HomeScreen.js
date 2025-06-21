import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getObras } from '../api/obras'; // Importa a função de API

const HomeScreen = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const fetchObras = async () => {
    try {
      setLoading(true);
      const response = await getObras();
      setObras(response.data.data); // Ajuste conforme a estrutura da sua resposta da API
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar obras:', err);
      setError('Não foi possível carregar as obras. Verifique a conexão com o servidor.');
      Alert.alert('Erro', 'Não foi possível carregar as obras. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Usa useFocusEffect para recarregar os dados sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      fetchObras();
    }, [])
  );

  const renderObraItem = ({ item }) => (
    <TouchableOpacity
      style={styles.obraItem}
      onPress={() => navigation.navigate('ObraDetails', { obraId: item._id })}
    >
      <Text style={styles.obraName}>{item.nome}</Text>
      <Text style={styles.obraResponsavel}>Responsável: {item.responsavel}</Text>
      <Text style={styles.obraStatus}>Status: {item.status}</Text>
      <Text style={styles.obraDate}>Início: {new Date(item.dataInicio).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando Obras...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchObras}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {obras.length === 0 ? (
        <View style={styles.centered}>
          <Text>Nenhuma obra cadastrada ainda.</Text>
          <Text>Clique no '+' para adicionar uma nova obra.</Text>
        </View>
      ) : (
        <FlatList
          data={obras}
          keyExtractor={(item) => item._id}
          renderItem={renderObraItem}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ObraForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  listContent: {
    paddingBottom: 80, // Espaço para o FAB
  },
  obraItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  obraName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  obraResponsavel: {
    fontSize: 14,
    color: '#666',
  },
  obraStatus: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  obraDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007bff',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 30, // Para centralizar o '+'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  }
});

export default HomeScreen;