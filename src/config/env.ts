import * as env from 'env-var';

export const PORT = env.get('PORT').default(3001).asPortNumber();

export const CORS_ORIGIN = env.get('CORS_ORIGIN').asArray(',');

export const REDIS_URL = env.get('REDIS_URL').required().asString();

export const SPOTIFY_CLIENT_ID = env
  .get('SPOTIFY_CLIENT_ID')
  .required()
  .asString();
export const SPOTIFY_CLIENT_SECRET = env
  .get('SPOTIFY_CLIENT_SECRET')
  .required()
  .asString();
export const SPOTIFY_REDIRECT_URI = env
  .get('SPOTIFY_REDIRECT_URI')
  .required()
  .asString();
