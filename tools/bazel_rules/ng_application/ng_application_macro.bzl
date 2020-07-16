load("//tools/bazel_rules:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("@npm//@bazel/typescript:index.bzl", "ts_devserver")
load("@build_bazel_rules_nodejs//:index.bzl", "pkg_web")
load("@npm//@babel/cli:index.bzl", "babel")
load("@npm//html-insert-assets:index.bzl", "html_insert_assets")


load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load("@npm//@bazel/terser:index.bzl", "terser_minified")
load("//tools/bazel_rules/rollup:rollup.bzl", "rollup")


def ng_application_macro(
        name,
        entry_point,
        index_html,
        deps,
        **kwargs):
    rollup_config = "//tools/bazel_rules/ng_application:rollup.config.js"

    rollup(
        # name = "%s_bundle" % name,
        name = name,
        rollup_config = rollup_config,
        entry_point = {
            (entry_point): "main-bundle",
        },
        deps = deps,
    )

    # html_insert_assets(
    #     name = "inject_scripts_for_dev",
    #     outs = ["index.html"],
    #     args = [
    #         "--html=$(execpath //src:example/index.html)",
    #         "--out=$@",
    #         "--roots=. $(RULEDIR)",
    #         "--assets",
    #     ]
    #     data = [index_html, ":%s_bundle" % name],
    # )

    # rollup_bundle(
    #     name = name,
    #     config_file = "%s_rollup_config" % name,
    #     entry_points = {
    #         (entry_point): name,
    #     },
    #     deps = config_data + deps + [
    #         "@npm//@rollup/plugin-node-resolve",
    #         "@npm//@rollup/plugin-commonjs",
    #         "@npm//@rollup/plugin-babel",
    #         # "@npm//rollup-plugin-sourcemaps",
    #         "@npm//@rollup/plugin-commonjs",
    #         "@npm//@rollup/plugin-babel",
    #         "@npm//@angular-devkit/build-optimizer",
    #     ],
    #     silent = True,
    #     format = format,
    #     sourcemap = "true",
    #     **kwargs
    # )

    # rollup_deps = [
    #     "@npm//rollup",
    #     "@npm//@rollup/plugin-node-resolve",
    #     "@npm//@rollup/plugin-commonjs",
    #     "@npm//@rollup/plugin-babel",
    #     rollup_config,
    # ]

    # print(entry_point)

    # nodejs_binary(
    #     name = name,
    #     entry_point = "@npm//:node_modules/rollup/dist/rollup.js",
    #     data = rollup_deps + deps,
    #     templated_args = [
    #         # "--nobazel_patch_module_resolver",
    #         "--config $(rootpath %s)" % rollup_config,
    #         "--entry_point %s" % entry_point
    #     ],
    # )

#     rollup_bundle(
#     name = "bundle-es2015",
#     config_file = "//apps/components-e2e:rollup.config.js",
#     entry_points = {
#         "main.prod.ts": "index"
#     },
#     # sourcemap = "false",
#     # output_dir = True,
#     deps = [":src"],
# )
