// fetch the version from package.json and patch the specified files

const version = require("../package.json").version;
const globby = require("globby");
const fs = require("fs");

function encode(str) {
  return (
    str
      // .replace(/\\/g, '\\\\')
      // .replace(/`/g, '\\`')
      // .replace(/\$\{/g, '$\\{')
      .trim()
  );
}

var licenseBanner = encode(fs.readFileSync("./licenseBanner.txt", "utf8"));
licenseBanner = licenseBanner.replace(/^(\s*version )([0-9.-]+[0-9.a-z-]*)/gm, function repl(s, m1, m2) {
  if (m2 !== version) {
    updated = true;
  }
  return m1 + version;
});
// console.log("license banner:", licenseBanner);

var count;

globby(["src/**/*.js", "build/**/*.js"])
  .then(paths => {
    count = 0;

    // console.log(paths);

    paths.forEach(path => {
      var updated = false;

      // console.log('path: ', path);

      var src = fs.readFileSync(path, "utf8");
      src = src.replace(/\/\*\*[^]+?Licensed under the Apache License[^]+?\*\/\s*/, function repl(s) {
        // console.log("checking existing comment vs banner:", s);
        if (s !== licenseBanner + "\n\n") {
          updated = true;
        }
        return licenseBanner + "\n\n";
      });

      // inject the header when it doesn't exist yet:
      if (src.indexOf("Licensed under the Apache License") === -1) {
        updated = true;
        console.log("ADDING license banner: ", path);
        src = licenseBanner + "\n\n" + src;
      }

      if (updated) {
        count++;
        console.log("updated: ", path);
        fs.writeFileSync(path, src, {
          encoding: "utf8",
          flags: "w"
        });
      }
    });
  })
  .then(() => {
    console.log("\nUpdated", count, "files' license banner for version", version);
  });
