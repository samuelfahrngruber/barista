load("@build_bazel_rules_nodejs//:index.bzl", "pkg_web", "copy_to_bin")
load("//tools/bazel_rules/rollup:rollup.bzl", "rollup")

def ng_application_macro(
        name,
        entry_point,
        index_html,
        deps,
        assets = [],
        root_paths = [],
        **kwargs):
    # Rollup configuration for creating the angular bundles
    rollup_config = "//tools/bazel_rules/ng_application:rollup.config.js"


    # copy_to_bin(
    #     name = "html",
    #     srcs = [index_html]
    # )


    rollup(
        # name = name,
        name = "%s_bundle" % name,
        rollup_config = rollup_config,
        entry_point = {
            (entry_point): "main-bundle",
        },
        deps = deps,
    )

    pkg_web(
        name = name,
        srcs = assets + [
            ":%s_bundle" % name,
        ],
        additional_root_paths = root_paths
    )

