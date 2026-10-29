const normalizeEmail = (email) => email.trim().toLowerCase();

const isValidEmail = (email) => (
  typeof email === 'string'
  && email.trim().length <= 254
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
);

const isValidRegistrationPassword = (password) => (
  typeof password === 'string'
  && Buffer.byteLength(password, 'utf8') >= 12
  && Buffer.byteLength(password, 'utf8') <= 72
);

const validateTask = ({ title, description }) => {
  if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 255) {
    return 'Title must be between 1 and 255 characters';
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    return 'Description must be a string';
  }

  if (typeof description === 'string' && description.length > 5000) {
    return 'Description must be 5000 characters or fewer';
  }

  return null;
};

const isValidTaskId = (id) => (
  typeof id === 'string'
  && /^\d+$/.test(id)
  && Number.isSafeInteger(Number(id))
  && Number(id) > 0
);

module.exports = {
  isValidEmail,
  isValidRegistrationPassword,
  isValidTaskId,
  normalizeEmail,
  validateTask,
};
