load("@npm//es-dev-server:index.bzl", "es_dev_server")
load("@build_bazel_rules_nodejs//:providers.bzl", "JSModuleInfo", "JSNamedModuleInfo", "JSEcmaScriptModuleInfo")

def _get_entry_files(files, entries = []):
    # Convert input into list regardles of being a depset or list
    input_list = files.to_list() if type(files) == "depset" else files
    filtered = []

    for file in input_list:
        if not file.path.startswith("external"):
            for entry in entries:
                if file.path.endswith(entry) or file.path.endswith(entry + ".js"):
                    filtered.append(file)
                    continue

    return filtered

def _js_sources_impl(ctx):
    depsets = []

    for src in ctx.attr.srcs:
        # print(src[JSEcmaScriptModuleInfo])
        if JSEcmaScriptModuleInfo in src:
            depsets.append(src[JSEcmaScriptModuleInfo].sources)
        # if JSModuleInfo in src:
        #     depsets.append(src[JSModuleInfo].sources)
        # if JSNamedModuleInfo in src:
        #     depsets.append(src[JSNamedModuleInfo].sources)
        # if hasattr(src, "files"):
        #     depsets.append(src.files)
    sources = depset(transitive = depsets)

    # print(_get_entry_files(sources, ["main.dev"]))

    ctx.actions.write(ctx.outputs.manifest, "".join([
        f.short_path + "\n"
        for f in sources.to_list()
        if f.path.endswith(".js") or f.path.endswith(".mjs")
    ]))

    return [DefaultInfo(files = sources)]

_js_sources = rule(
    implementation = _js_sources_impl,
    attrs = {
        "srcs": attr.label_list(
            allow_files = True,
        ),
    },
    outputs = {
        "manifest": "%{name}.MF",
    },
)

def dev_server_macro(
        # entry_module,
        name = "devserver",
        template = ":index.html",
        port = 4200,
        assets = [],
        deps = []):
    "A dev server"

    _js_sources(
        name = "%s_sources" % name,
        srcs = deps,
    )
    config = "//tools/bazel_rules/dev_server:es-dev-server.config.js"

    args = [
        "--config $(rootpath %s)" % config,
        "--index $(rootpath %s)" % template,
        "--mappings _%s.module_mappings.json" % name,
        "--port %s" % port,
    ]

    es_dev_server(
        name = name,
        data =  deps + [
            ":%s_sources" % name,
            config,
            template,
            "@npm//yargs",
            "@npm//@rollup/plugin-node-resolve",
            "//tools/bazel_rules:utils.js",
        ],
        templated_args = args,
    )
    # nodejs_binary(
    #     name = name,
    #     entry_point = "//tools/bazel_rules/dev_server:es-dev-server.config.js",
    #     data = deps + [
    #         "@npm//yargs",
    #     ],
    #     templated_args = args,
    # )

    # insert_assets_name = name + "_inject_scripts"

    # html_insert_assets(
    #     name = insert_assets_name,
    #     outs = ["index.html"],
    #     args = [
    #         "--html=$(execpath %s)" % template,
    #         "--out=$@",
    #         "--roots=. $(RULEDIR)",
    #         "--assets",
    #     ] + ["$(execpath %s)" % s for s in assets] + [
    #         # This file doesn't exist during the build, but will be served by ts_devserver
    #         "./_/ts_scripts.js",
    #     ],
    #     data = [template] + assets,
    # )

    # ts_devserver(
    #     name = name,
    #     port = port,
    #     entry_module = entry_module,
    #     scripts = [
    #         "@npm//:node_modules/tslib/tslib.js",
    #         "//tools/bazel_rules/dev_server:rxjs_umd_modules",
    #     ],
    #     static_files = assets + [
    #         ":%s" % insert_assets_name,
    #         template,
    #     ],
    #     deps = deps,
    # )
