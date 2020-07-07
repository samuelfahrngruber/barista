load("@npm//@bazel/typescript:index.bzl", "ts_devserver")
load("@npm//html-insert-assets:index.bzl", "html_insert_assets")

def dev_server_macro(
        entry_module,
        template = ":index.html",
        name = "devserver",
        port = 4200,
        assets = [],
        deps = []):

    insert_assets_name = name + "_inject_scripts"

    html_insert_assets(
        name = insert_assets_name,
        outs = ["index.html"],
        args = [
            "--html=$(execpath %s)" % template,
            "--out=$@",
            "--roots=. $(RULEDIR)",
            "--assets",
        ] + ["$(execpath %s)" % s for s in assets] + [
            # This file doesn't exist during the build, but will be served by ts_devserver
            "./_/ts_scripts.js",
        ],
        data = [template] + assets,
    )

    ts_devserver(
        name = name,
        port = port,
        entry_module = entry_module,
        scripts = [
            "@npm//:node_modules/tslib/tslib.js",
            "//tools/bazel_rules/dev_server:rxjs_umd_modules",
        ],
        static_files = assets + [
            ":%s" % insert_assets_name,
            template,
        ],
        deps = deps,
    )
