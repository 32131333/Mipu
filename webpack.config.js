// Я сошёл сума. Что ето такое? Помогити мне в етом разабраца, я не понимаю. Я пытался понять, я не понимаю импорты

const path = require('path');
const fs = require('fs');

/*function getAllScripts(dir, r) {
  if (!r) r = [];
  
  const d = fs.readdirSync(dir);
  for (const a of d) {
    let st = fs.lstatSync(dir+"/"+a);
    if (st.isDirectory()) getAllScripts(dir+"/"+a, r)
    else if (st.isFile()) {
      if (a.endsWith(".js")||a.endsWith(".jsx")) r.push(dir+"/"+a);
    };
  };
  
  return r;
};*/

//const webpack = require("webpack");

function getAllScripts(dir, r) {
  if (!r) r = {
    shared: [
		"react", "react-dom/client", "react-router",
		"./page/translatable_static/modals.jsx", "./page/translatable_static/contextmenu.jsx",
		"./page/translatable_static/router.jsx", "./page/translatable_static/nav.jsx", "./page/translatable_static/components.jsx",
		"./page/translatable_static/imageCropper.jsx", "react-markdown", "emoji-mart", /*"react-popper",*/ "use-immer",
		"remark-gfm", "slate", "slate-react", "is-hotkey", "@twemoji/parser",  "@twemoji/api", "react-lazy-load-image-component",
		"remark-breaks", "./page/static/languages.json", "socket.io-client", "./page/translatable_static/socketio_client.js",
		"@floating-ui/core", "@floating-ui/react", "./page/translatable_static/tooltip.jsx", "./page/static/timer.js",
		"./page/translatable_static/toasts.jsx", "./page/translatable_static/miposts.jsx", "zustand", "./page/translatable_static/processoverlay.jsx"
		/* "./page/translatable_static/usestatestatic.jsx" */
	]
  };
  
  const d = fs.readdirSync(dir);
  for (const a of d) {
    let st = fs.lstatSync(dir+"/"+a);
    if (st.isDirectory()) getAllScripts(dir+"/"+a, r)
    else if (st.isFile()) {
      if (a.endsWith(".js")||a.endsWith(".jsx")) {
        /*let fileName = a.split(".")[0];
        r[fileName] = {"import": path.resolve(dir+"/"+a), filename: dir+"/"+a, dependOn: "shared", chunkLoading: "import"};*/
		r.shared.push(dir+"/"+a);
      };
    };
  };
  loadSVG("./page/static/svg", r);
  
  return r;
};
function loadSVG(dir, r) {
  const d = fs.readdirSync(dir);
  for (const a of d) {
    let st = fs.lstatSync(dir+"/"+a);
    if (st.isDirectory()) loadSVG(dir+"/"+a, r)
    else if (st.isFile()) {
      if (a.endsWith(".svg")) {
		r.shared.push(dir+"/"+a);
      };
    };
  };
};
module.exports = {
  //entry: [path.resolve("translatable_static/router.jsx"), ...getAllScripts(path.resolve("translatable_static/templates"))], // Ваш входной файл
  //mode: "production",
  //mode: "development",
  cache: true,
  //devtool: "eval",
  entry: getAllScripts("./page/translatable_static/templates"),
  output: {
    path: path.resolve("page/translatable_static"), // Путь к выходной директории
    filename: 'bundle.js' // Название выходного файла
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Регулярное выражение для выбора файлов .js и .jsx
        exclude: /node_modules/, // Исключение директории node_modules
        use: {
          loader: 'babel-loader', // Использование babel-loader для транспиляции кода
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
	  {
		  test: /\.svg$/,
		  exclude: /node_modules/,
		  use: {
			  loader: 'svg-inline-loader'
		  }
	  },
	  { test: /\.json$/, type: 'json' }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.svg'], // Расширения файлов для обработки
	alias: {
	  svg: path.resolve(__dirname, 'page/static/svg'),
      templates: path.resolve(__dirname, 'page/translatable_static/templates/'), // Добавьте этот алиас
	  m: path.resolve(__dirname, 'page/translatable_static/')
	}
  },
  /*plugins: [
    new webpack.ProvidePlugin({
		React: "react" // umd-версия
	})
  ]*/
  /*externals: {
    react: 'React'
  }*/
};