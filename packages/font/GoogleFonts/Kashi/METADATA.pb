name: "Kashi"
designer: "Sepanta Pouya, Alireza Eskandari, Saber Rastikerdar"
license: "OFL"
category: "SANS_SERIF"
date_added: "2026-11-27"
fonts {
  name: "Kashi"
  style: "normal"
  weight: 400
  filename: "Kashi[wdth,wght].ttf"
  post_script_name: "Kashi-Regular"
  full_name: "Kashi Regular"
  copyright: "Copyright 2026 The Kashi Project Authors (https://github.com/Sepantapouya/Kashi). Copyright 2015 The Vazirmatn Project Authors (https://github.com/rastikerdar/vazirmatn). Copyright 2026 The Dastkhat Project Authors (https://github.com/dastyar-io/dastkhat-font)."
}
subsets: "arabic"
subsets: "latin"
subsets: "latin-ext"
subsets: "menu"
axes {
  tag: "wdth"
  min_value: 100.0
  max_value: 125.0
}
axes {
  tag: "wght"
  min_value: 100.0
  max_value: 900.0
}
primary_script: "Arab"
source {
  repository_url: "https://github.com/Sepantapouya/Kashi"
  commit: "fff0bb652b53e38cf4d4e37a7d9790430cbe850b"
  files {
    source_file: "packages/font/OFL.txt"
    dest_file: "OFL.txt"
  }
  files {
    source_file: "packages/font/GoogleFonts/Kashi/article/ARTICLE.en_us.html"
    dest_file: "article/ARTICLE.en_us.html"
  }
  files {
    source_file: "packages/font/fonts/GoogleFonts/variable/Kashi[wdth,wght].ttf"
    dest_file: "Kashi[wdth,wght].ttf"
  }
  branch: "main"
  config_yaml: "packages/font/sources/config.yaml"
}
