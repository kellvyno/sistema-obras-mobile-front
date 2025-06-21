import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Image, ActivityIndicator, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker'; // Corrigido de '*s' para '* as'
import { createFiscalizacao, getFiscalizacaoById, updateFiscalizacao } from '../api/fiscalizacoes'; // Importa funções de API

import { Picker } from '@react-native-picker/picker'; // << 1. IMPORTAR O PICKER

const FiscalizacaoFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { obraId, fiscalizacaoId } = route.params;

  const [data, setData] = useState(new Date());
  const [status, setStatus] = useState('Conforme'); // Definindo um valor inicial válido
  const [observacoes, setObservacoes] = useState('');
  const [foto, setFoto] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [fiscal, setFiscal] = useState('');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetchingFiscalizacao, setIsFetchingFiscalizacao] = useState(false);

  // << 2. DEFINIR AS OPÇÕES VÁLIDAS PARA O STATUS
  const statusOptions = ['Conforme', 'Não Conforme', 'Pendente', 'Em Análise'];

  // Carregar dados da fiscalização se estiver em modo de edição
  useEffect(() => {
    if (fiscalizacaoId) {
      setIsFetchingFiscalizacao(true);
      const fetchFiscalizacaoData = async () => {
        try {
          const response = await getFiscalizacaoById(fiscalizacaoId);
          const fiscData = response.data.data;
          setData(new Date(fiscData.data));
          // Garante que o status carregado seja um dos válidos, se não, usa 'Conforme'
          setStatus(statusOptions.includes(fiscData.status) ? fiscData.status : 'Conforme');
          setObservacoes(fiscData.observacoes);
          setFoto(fiscData.foto);
          setLatitude(fiscData.localizacao.latitude.toString());
          setLongitude(fiscData.localizacao.longitude.toString());
          setFiscal(fiscData.fiscal);
        } catch (err) {
          console.error('Erro ao carregar dados da fiscalização para edição:', err);
          Alert.alert('Erro', 'Não foi possível carregar os dados da fiscalização.');
        } finally {
          setIsFetchingFiscalizacao(false);
        }
      };
      fetchFiscalizacaoData();
    }
  }, [fiscalizacaoId]);

  // Funções para o DatePicker (mantém o mesmo)
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    setData(date);
    hideDatePicker();
  };

  // Obter Localização GPS (mantém o mesmo)
  const getLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de Localização Negada', 'Por favor, conceda permissão de localização para usar este recurso.');
      setLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      Alert.alert('Localização Obtida', `Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`);
    } catch (err) {
      console.error('Erro ao obter localização:', err);
      Alert.alert('Erro de Localização', 'Não foi possível obter a localização atual.');
    } finally {
      setLoading(false);
    }
  };

  // Selecionar Imagem (Câmera/Galeria) (mantém o mesmo)
  const pickImage = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' && galleryStatus !== 'granted') {
      Alert.alert('Permissão Necessária', 'Permissão para câmera ou galeria é necessária para selecionar uma foto.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
      Alert.alert('Foto Selecionada', 'Foto pronta para ser enviada!');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fiscalizacaoData = {
        data: data.toISOString(),
        status, // Valor do Picker
        observacoes,
        localizacao: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        foto: foto || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Fiscalizacao',
        obra: obraId,
        fiscal,
      };

      if (fiscalizacaoId) {
        await updateFiscalizacao(fiscalizacaoId, fiscalizacaoData);
        Alert.alert('Sucesso', 'Fiscalização atualizada com sucesso!');
      } else {
        await createFiscalizacao(fiscalizacaoData);
        Alert.alert('Sucesso', 'Fiscalização cadastrada com sucesso!');
      }
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao salvar fiscalização:', err.response?.data || err.message);
      Alert.alert('Erro', `Não foi possível salvar a fiscalização: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isFetchingFiscalizacao) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados da fiscalização...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{fiscalizacaoId ? 'Editar Fiscalização' : 'Nova Fiscalização'}</Text>

      {/* ... outros campos ... */}

      <Text style={styles.label}>Data da Fiscalização:</Text>
      <TouchableOpacity onPress={showDatePicker} style={styles.dateInput}>
        <Text>{data.toLocaleDateString()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={data}
      />

      <Text style={styles.label}>Status:</Text>
      {/* << 3. SUBSTITUIR O TEXTINPUT PELO PICKER */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={status}
          onValueChange={(itemValue, itemIndex) => setStatus(itemValue)}
          style={styles.picker}
        >
          {statusOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Observações:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="Observações da fiscalização"
        multiline
        numberOfLines={4}
      />

      {/* ... restante do formulário ... */}

      <Text style={styles.label}>Fiscal:</Text>
      <TextInput
        style={styles.input}
        value={fiscal}
        onChangeText={setFiscal}
        placeholder="Nome do fiscal"
      />

      <Text style={styles.label}>Localização (GPS):</Text>
      <View style={styles.locationContainer}>
        <TextInput
          style={[styles.input, styles.locationInput]}
          value={latitude}
          onChangeText={setLatitude}
          placeholder="Latitude"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.locationInput]}
          value={longitude}
          onChangeText={setLongitude}
          placeholder="Longitude"
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={getLocation} style={styles.locationButton} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Obtendo...' : 'Obter GPS'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Foto da Fiscalização:</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
        <Text style={styles.buttonText}>Selecionar Foto (Câmera/Galeria)</Text>
      </TouchableOpacity>
      {foto && <Image source={{ uri: foto }} style={styles.imagePreview} />}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Salvando...' : (fiscalizacaoId ? 'Atualizar Fiscalização' : 'Cadastrar Fiscalização')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    justifyContent: 'center',
    height: 50,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationInput: {
    flex: 1,
    marginRight: 10,
  },
  locationButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  imagePickerButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // << 4. NOVOS ESTILOS PARA O PICKER
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50, // Ajuste a altura conforme necessário
    width: '100%',
  },
});

export default FiscalizacaoFormScreen;