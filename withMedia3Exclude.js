const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withMedia3Exclude(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const exclusion = `
configurations.all {
    exclude group: "com.github.MissingCore.media"
}
`;
      if (!config.modResults.contents.includes('com.github.MissingCore.media')) {
        config.modResults.contents += exclusion;
      }
    }
    return config;
  });
};
