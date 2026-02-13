module.exports = ({ config }) => {
  return {
    ...config,
    experiments: {
      ...config.experiments,
      baseUrl: process.env.EXPO_PUBLIC_BASE_URL || '',
    },
  };
};
