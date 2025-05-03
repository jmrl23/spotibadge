import axios from 'axios';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '../../../config/env';

export const api = axios.create({
  baseURL: 'https://api.spotify.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const accounts = axios.create({
  baseURL: 'https://accounts.spotify.com',
  headers: {
    authorization: `Basic ${Buffer.from(
      SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET,
    ).toString('base64')}`,
    'content-type': 'application/x-www-form-urlencoded',
  },
});
