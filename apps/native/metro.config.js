const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, "../..");
const wsShimPath = path.resolve(__dirname, "./shims/ws.js");

config.watchFolders = [workspaceRoot];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  ws: wsShimPath,
};
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules/expo-router/node_modules"),
  path.resolve(workspaceRoot, "node_modules/react-native/node_modules"),
];
config.resolver.disableHierarchicalLookup = false;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "ws") {
    return {
      filePath: wsShimPath,
      type: "sourceFile",
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
