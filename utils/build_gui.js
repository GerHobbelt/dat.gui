var minify = (process.argv[2] === 'min');

require('./builder.js').build({
    verbose: true,
    baseUrl: "../src/",
    main: "dat/gui/GUI",
    out: "../build/dat.GUI" + (minify ? ".min" : "") + ".js",
    minify: minify,
    shortcut: "dat.GUI",
    paths: {},
    umd: {
        ret: 'dat'
    }
});
