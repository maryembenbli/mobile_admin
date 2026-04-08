export function getApiErrorMessage(error: any, fallback = 'Une erreur est survenue.') {
  if (!error) return fallback;

  if (error?.code === 'ECONNABORTED') {
    return 'Le serveur met trop de temps a repondre. Verifiez que le backend NestJS et MongoDB sont bien demarres.';
  }

  if (error?.message === 'Network Error') {
    return "Impossible de contacter le serveur. Verifiez que le backend NestJS est demarre sur le port 3000.";
  }

  const data = error?.response?.data;
  const message = data?.message;

  if (Array.isArray(message)) {
    return message.join('\n');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
