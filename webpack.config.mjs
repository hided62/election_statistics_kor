import webpack from "webpack";
import path from "path";

const __dirname = path.resolve();

const moduleInfos = {
  election2022_president: {
    name: "개표진행 대선 2022",
    namespace: "https://hided.net/",
    version: "0.997",
    description:
      "개표 진행 상황을 보여줍니다. 각 시군구별 개별 개표율을 합산한 득표율을 보여줍니다.",
    author: "Hide_D",
    requires: ["jquery"],
    match: ["http://info.nec.go.kr/electioninfo/electionInfo_report.xhtml"],
    srcPrefix: 'https://raw.githubusercontent.com/hided62/election_statistics_kor/main/dist/',
    grant: ["none"],
  },
  election2022_6: {
    name: "개표진행 지방선거 2022",
    namespace: "https://hided.net/",
    version: "0.25",
    description:
      "개표 진행 상황을 보여줍니다. 각 시군구별 개별 개표율을 합산한 득표율을 보여줍니다. 광역시,도지사만 보여줍니다.",
    author: "Hide_D",
    requires: ["jquery"],
    match: ["http://info.nec.go.kr/electioninfo/electionInfo_report.xhtml"],
    srcPrefix: 'https://raw.githubusercontent.com/hided62/election_statistics_kor/main/dist/',
    grant: ["none"],
  }
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
    "supportURL",
    "srcPrefix",
    "downloadURL",
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
    if (key === "srcPrefix"){
      const path = `${moduleInfo[key]}${filename}`;
      banner.push(`// @${"downloadURL".padEnd(padlen)} ${path}`);
      banner.push(`// @${"updateURL".padEnd(padlen)} ${path}`);
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
