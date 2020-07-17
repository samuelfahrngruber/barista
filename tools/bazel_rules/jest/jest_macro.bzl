load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")
load("@npm//@bazel/typescript:index.bzl", "ts_config", "ts_library")
load("//tools/bazel_rules:helpers.bzl", "join")

def jest_macro(
        srcs,
        jest_config,
        setup_file = None,
        ts_config = "//tools/bazel_rules/jest:tsconfig_jest_default",
        name = "test",
        deps = [],
        **kwargs):

    test_sources = srcs;
    jest_deps = [
        ":%s_compile" % name,
        jest_config,
        "@npm//jest-preset-angular",
        "@npm//jest-junit",
        "//tools/bazel_rules/jest:jest-runner.js",
        "//tools/bazel_rules/jest:jest-resolver.js",
    ]



    test_args = [
        "--nobazel_patch_module_resolver",
        "--suite %s" % name,
        "--files=\"%s\"" % join(srcs, ","),
        "--jestConfig $(rootpath %s)" % jest_config,
    ]


    if setup_file:
        test_sources.append(setup_file)
        jest_deps.append(setup_file)
        test_args.append("--setupFile $(rootpath %s)" % setup_file)


    # compile the spec files first
    ts_library(
        name = name + "_compile",
        srcs = test_sources,
        tsconfig = ts_config,
        testonly = True,
        deps = deps + [
            "@npm//tslib",
            "@npm//@types/jest",
        ],
    )

    nodejs_test(
        name = name,
        testonly = True,
        data = deps +  jest_deps,
        entry_point = "//tools/bazel_rules/jest:jest-runner.js",
        templated_args = test_args
    )
