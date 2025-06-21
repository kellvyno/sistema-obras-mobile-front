import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Image, ActivityIndicator, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { createObra, getObraById, updateObra } from '../api/obras';

const ObraFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const obraId = route.params?.obraId; // Verifica se está editando

  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null); // URI da imagem local
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('Planejada'); // Exemplo de status inicial

  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetchingObra, setIsFetchingObra] = useState(false);

  // Carregar dados da obra se estiver em modo de edição
  useEffect(() => {
    if (obraId) {
      setIsFetchingObra(true);
      const fetchObraData = async () => {
        try {
          const response = await getObraById(obraId);
          const obraData = response.data.data; // Ajuste conforme a estrutura da sua resposta
          setNome(obraData.nome);
          setResponsavel(obraData.responsavel);
          setDataInicio(new Date(obraData.dataInicio));
          setDataFim(new Date(obraData.dataFim));
          setDescricao(obraData.descricao);
          setFoto(obraData.foto); // Se a foto já for uma URL pública
          setLatitude(obraData.localizacao.latitude.toString());
          setLongitude(obraData.localizacao.longitude.toString());
          setStatus(obraData.status);
        } catch (err) {
          console.error('Erro ao carregar dados da obra para edição:', err);
          Alert.alert('Erro', 'Não foi possível carregar os dados da obra.');
        } finally {
          setIsFetchingObra(false);
        }
      };
      fetchObraData();
    }
  }, [obraId]);

  // Funções para o DatePicker
  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);
  const handleConfirmStartDate = (date) => {
    setDataInicio(date);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);
  const handleConfirmEndDate = (date) => {
    setDataFim(date);
    hideEndDatePicker();
  };

  // Obter Localização GPS
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

  // Selecionar Imagem (Câmera/Galeria)
  const pickImage = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' && galleryStatus !== 'granted') {
      Alert.alert('Permissão Necessária', 'Permissão para câmera ou galeria é necessária para selecionar uma foto.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({ // ou launchImageLibraryAsync para galeria
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true, // Se o seu backend suportar base64
    });

    if (!result.canceled) {
      // Para fins de demonstração, vamos apenas usar a URI local.
      // Em um ambiente de produção, você precisaria fazer upload dessa imagem para um serviço de armazenamento
      // (ex: Cloudinary, S3) e obter uma URL pública para enviar ao backend.
      setFoto(result.assets[0].uri);
      Alert.alert('Foto Selecionada', 'Foto pronta para ser enviada!');

      // Exemplo de como você FARIA o upload real se tivesse um serviço:
      // const uploadResponse = await uploadImageToCloudinary(result.assets[0].uri);
      // setFoto(uploadResponse.url); // A URL pública da imagem
    }
  };


  const handleSubmit = async () => {
    setLoading(true);
    try {
      const obraData = {
        nome,
        responsavel,
        dataInicio: dataInicio.toISOString(), // Formato ISO 8601
        dataFim: dataFim.toISOString(),     // Formato ISO 8601
        localizacao: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        descricao,
        foto: foto || 'https://via.placeholder.com/150', // Substitua por URL de imagem real ou lógica de upload
        status,
      };

      if (obraId) {
        await updateObra(obraId, obraData);
        Alert.alert('Sucesso', 'Obra atualizada com sucesso!');
      } else {
        await createObra(obraData);
        Alert.alert('Sucesso', 'Obra cadastrada com sucesso!');
      }
      navigation.goBack(); // Volta para a tela anterior (Home)
    } catch (err) {
      console.error('Erro ao salvar obra:', err.response?.data || err.message);
      Alert.alert('Erro', `Não foi possível salvar a obra: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isFetchingObra) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados da obra...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{obraId ? 'Editar Obra' : 'Nova Obra'}</Text>

      <Text style={styles.label}>Nome da Obra:</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome da Obra"
      />

      <Text style={styles.label}>Responsável:</Text>
      <TextInput
        style={styles.input}
        value={responsavel}
        onChangeText={setResponsavel}
        placeholder="Responsável pela Obra"
      />

      <Text style={styles.label}>Data de Início:</Text>
      <TouchableOpacity onPress={showStartDatePicker} style={styles.dateInput}>
        <Text>{dataInicio.toLocaleDateString()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmStartDate}
        onCancel={hideStartDatePicker}
        date={dataInicio}
      />

      <Text style={styles.label}>Data de Término:</Text>
      <TouchableOpacity onPress={showEndDatePicker} style={styles.dateInput}>
        <Text>{dataFim.toLocaleDateString()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmEndDate}
        onCancel={hideEndDatePicker}
        date={dataFim}
      />

      <Text style={styles.label}>Descrição:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Descrição detalhada da obra"
        multiline
        numberOfLines={4}
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

      <Text style={styles.label}>Foto da Obra:</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
        <Text style={styles.buttonText}>Selecionar Foto (Câmera/Galeria)</Text>
      </TouchableOpacity>
      {foto && <Image source={{ uri: foto }} style={styles.imagePreview} />}

      {/* Exemplo de seleção de status, pode ser um Picker ou botões */}
      <Text style={styles.label}>Status:</Text>
      <TextInput
        style={styles.input}
        value={status}
        onChangeText={setStatus}
        placeholder="Status (e.g., Planejada, Em Andamento)"
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Salvando...' : (obraId ? 'Atualizar Obra' : 'Cadastrar Obra')}</Text>
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
});

export default ObraFormScreen;