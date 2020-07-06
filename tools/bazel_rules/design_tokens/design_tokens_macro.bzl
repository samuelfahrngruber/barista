
load("@build_bazel_rules_nodejs//:providers.bzl", "JSEcmaScriptModuleInfo", "NpmPackageInfo", "run_node")
load("//tools/bazel_rules:helpers.bzl", "join")

def _design_tokens_impl(ctx):

    inputs = []
    entrypoints = []
    aliases = []

    for src in ctx.attr.entrypoints:
        inputs.extend(src.files.to_list())
        entrypoints.extend([file.short_path for file in src.files.to_list()])

    for src in ctx.attr.aliases:
        inputs.extend(src.files.to_list())
        aliases.extend([file.short_path for file in src.files.to_list()])

    output_file = ctx.actions.declare_file("output")
    print()

    args = [
        "--entrypoints",
        join(entrypoints, ','),
        "--aliases",
        join(aliases, ','),
        "--outputPath ./",
        "--baseDirectory",
        "libs/shared/design-tokens/src/lib"
    ]

            # "entrypoints": ["global/**.yml", "patterns/**.yml"],
    #         "aliasesEntrypoints": ["aliases/**.yml"],
    #         "outputPath": "libs/shared/design-tokens/generated/",
    #         "baseDirectory": "libs/shared/design-tokens/src/lib"
    # # Action to call the script.
    ctx.actions.run(
        inputs = inputs,
        outputs = [output_file],
        arguments = args,
    #     progress_message = "Merging into %s" % ctx.outputs.out.short_path,
        executable = ctx.executable._cli,
    )

    return [DefaultInfo()]

# design_tokens_macro = rule(
#     implementation = _design_tokens_impl,
#     attrs = {
#         "_cli": attr.label(
#             executable = True,
#             cfg = "host",
#             default = Label("//libs/workspace/src/builders/design-tokens/build:cli"),
#         ),
#         "entrypoints": attr.label_list(
#             allow_files = True,
#             default = [],
#         ),
#         "aliases": attr.label_list(
#             allow_files = True,
#             default = [],
#         ),
#     },
# )

def design_tokens_macro(name, entrypoints, aliases, **kwargs):


    # cli = Label("//libs/workspace/src/builders/design-tokens/build:cli")


    native.genrule(
        name = "build",
        outs = ["concatenated.txt"],
        cmd = """$(execpath //libs/workspace/src/builders/design-tokens/build:cli) \
            --baseDirectory libs/shared/design-tokens/src/lib
        """,
        # src = [],
        output_to_bindir = True,
        # tools = [cli],
    )


    # native.genrule(
    #     name = name,
    #     # srcs = ["//libs/workspace/src/builders/design-tokens/build:cli"],
    #     outs = ["outfile"],
    #     cmd = "$(locations ) > $@"
    #     # cmd = "$(execpath //libs/workspace/src/builders/design-tokens/build:cli)"
    # )
    # # _design_tokens(
    # #     entrypoints,
    # #     aliases,
    # #     **kwargs
    # # )
