import axios from 'axios';

// NOTA: Se testares num telemóvel físico via Expo Go, substitui 'localhost' 
// pelo IP local da tua máquina (ex: 'http://192.168.1.X:3333').
export const api = axios.create({
  baseURL: 'http://localhost:3333',
});