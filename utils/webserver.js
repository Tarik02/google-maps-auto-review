var WebpackDevServer = require("webpack-dev-server"),
    webpack = require("webpack"),
    config = require("../webpack.config"),
    env = require("./env"),
    path = require("path");

var options = (config.chromeExtensionBoilerplate || {});
var excludeEntriesToHotReload = (options.notHotReload || []);

for (var entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] =
      [
        // ("webpack-dev-server/client?http://localhost:" + env.PORT),
        // "webpack/hot/dev-server"
      ].concat(config.entry[entryName]);
  }
}

delete config.chromeExtensionBoilerplate;

config.output.publicPath = `http://localhost:${env.PORT}`;

var compiler = webpack(config);

var server =
  new WebpackDevServer({
    hot: false,
    static: {
      directory: path.join(__dirname, "../build"),
      publicPath: `http://localhost:${env.PORT}`
    },
    host: 'localhost',
    port: env.PORT,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    allowedHosts: 'all',
    devMiddleware: {
      writeToDisk: true
    }
  }, compiler);

server.start(env.PORT);
