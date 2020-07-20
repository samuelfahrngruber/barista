load("@build_bazel_rules_nodejs//:index.bzl", "pkg_web", "nodejs_binary")
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

    native.filegroup(
        name = "es6",
        srcs = deps,
        # Change to es6_sources to get the 'prodmode' JS
        output_group = "es6_sources",
    )

    nodejs_binary(
        name = name,
        data = deps + [
            ":es6",
            "//tools/bazel_rules/ng_application"
        ],
        entry_point = "//tools/bazel_rules/ng_application:ng-application.ts",
        templated_args = [
            "--index",
            "%s" % index_html,
            "--entry rtasdfasdf",
            # "--index $(execpath %s)" % index_html
        ]

    )

    # rollup(
    #     name = "%s_bundle" % name,
    #     rollup_config = rollup_config,
    #     entry_point = {
    #         (entry_point): "main-bundle",
    #     },
    #     deps = deps + [
    #         "//tools/bazel_rules/ng_application:test"
    #     ],
    # )

    # pkg_web(
    #     name = name,
    #     srcs = assets + [
    #         ":%s_bundle" % name,
    #     ],
    #     additional_root_paths = root_paths,
    # )

