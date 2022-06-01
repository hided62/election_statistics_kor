import webpack from "webpack";
import path from "path";

const __dirname = path.resolve();

const moduleInfos = {
  election2022_president: {
    name: "개표진행 대선 2022",
    namespace: "https://hided.net/",
    version: "0.995",
    description:
      "개표 진행 상황을 보여줍니다. 각 시군구별 개별 개표율을 합산한 득표율을 보여줍니다.",
    author: "Hide_D",
    requires: ["jquery"],
    match: ["http://info.nec.go.kr/electioninfo/electionInfo_report.xhtml"],
    updateURL: "https://hided.net/gs_script/election2022.user.js",
    grant: "none",
  },
};

const requirePath = {
  jquery: "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",
};

function generateBanner(args) {
  const argOrder = [
    "name",
    "namespace",
    "version",
    "description",
    "author",
    "requires",
    "match",
    "updateURL",
    "grant",
  ];
  const { filename } = args;
  const entryName = filename.replace(/\.user\.js$/, "");
  console.log(filename);
  const moduleInfo = moduleInfos[entryName];
  if (moduleInfo === undefined) {
    console.log("no module info");
    return "";
  }

  const banner = [`// ==UserScript==`];
  const padlen = 12;

  for (const key of argOrder) {
    if (!(key in moduleInfo)) {
      continue;
    }
    if (key === "requires") {
      const requires = moduleInfo[key];
      const requiresBanner = requires.map(
        (require) => `// @${"require".padEnd(padlen)} ${requirePath[require]}`
      );
      banner.push(...requiresBanner);
      continue;
    }
    const value = moduleInfo[key];
    if (typeof value === 'string') {
      banner.push(`// @${key.padEnd(padlen)} ${value}`);
    }
    else {
      for (const v of value) {
        banner.push(`// @${key.padEnd(padlen)} ${v}`);
      }
    }
  }

  banner.push(`// ==/UserScript==`);
  banner.push();
  return banner.join("\n");
}

const swcOptions = {
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: false,
      decorators: false,
      dynamicImport: false,
    },
    preserveAllComments: true,
  },
  env: {
    targets: [
      "last 3 Chrome versions",
      "last 3 Firefox versions",
      "last 3 Edge versions",
    ],
    mode: "entry",
  },
  minify: false,
  module: {
    type: "commonjs",
    strictMode: true,
  },
};

export default {
  mode: "production",
  optimization: {
    minimize: false,
  },
  entry: Object.fromEntries(
    Object.keys(moduleInfos).map((key) => [
      key,
      path.resolve(__dirname, `src/${key}.ts`),
    ])
  ),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].user.js",
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "swc-loader",
          options: swcOptions,
        },
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: generateBanner,
      entryOnly: true,
      raw: true,
    }),
  ],
};
