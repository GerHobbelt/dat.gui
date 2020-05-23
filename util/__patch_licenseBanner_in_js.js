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
var separator = encode(fs.readFileSync("./licenseBannerSeparator.txt", "utf8"));
licenseBanner = licenseBanner.replace(/^(\s*version )([0-9.-]+[0-9.a-z-]*)/gm, function repl(s, m1, m2) {
  if (m2 !== version) {
    updated = true;
  }
  return m1 + version;
});
// console.log("license banner:", licenseBanner);

var count;

globby(["src/**/*.js", "src/**/*.*css", "build/**/*.js", "build/**/*.css"])
  .then((paths) => {
    count = 0;

    // console.log(paths);

    paths.forEach((path) => {
      var updated = false;

      // console.log('path: ', path);

      var src = fs.readFileSync(path, "utf8");
      var occurrence = 0;
      var prev_pos = 0;
      src = src.replace(/(\/\*\*(?:[^](?!\*\/))*?Licensed under the Apache License(?:[^](?!\*\/))*[^/]?\*\/)\s*/g, function repl(s, m1, pos) {
        occurrence++;
        //console.log("checking existing comment vs banner:", {occurrence, pos, m1_length: m1.length, s_len: s.length});
        if (occurrence > 1) {
          // there's multiple license headers in here: nuke all except the first!
          updated = true;
          // is there any content between this one and the previous occurrence or are they bunched up together?
          let diff = pos - prev_pos - s.length;
          prev_pos = pos;
          //console.log({diff});
          
          // heuristic: when there's more than 4 characters between occurrences, we inject a separator, otherwise we don't.
          return (diff > 4 ? separator : "") + "\n\n";
        }
        prev_pos = pos;
        if (s !== licenseBanner + "\n\n") {
          updated = true;
        }
        return licenseBanner + "\n\n";
      })
      // replace very long runs of newlines (which may have been caused by the multiple license replacements just above)
      .replace(/\r\n/g, '\n')
      .replace(/[\n]{4,}/g, '\n\n\n');

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
          flags: "w",
        });
      }
    });
  })
  .then(() => {
    console.log("\nUpdated", count, "files' license banner for version", version);
  });
