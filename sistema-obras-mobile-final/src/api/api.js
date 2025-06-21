// src/api/api.js
import axios from 'axios';

const api = axios.create({
  // Use o IP que o Metro Bundler mostrou quando você o iniciou:
  // No seu caso, a saída do Metro Bundler é: "Metro waiting on exp://192.168.0.104:8081"
  // Então, o IP da sua máquina é 192.168.0.104
  baseURL: 'http://192.168.0.104:3000/api', // << ALtere para o IP real da sua máquina
});

export default api;