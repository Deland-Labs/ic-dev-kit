import * as tsfmt from "typescript-formatter";




export const code_format = async (file_path : string) =>{
    await tsfmt
        .processFiles([file_path], {
            dryRun: true,
            replace: true,
            verify: false,
            tsconfig: true,
            tsconfigFile: null,
            tslint: true,
            tslintFile: null,
            editorconfig: true,
            vscode: false,
            vscodeFile: null,
            tsfmt: true,
            tsfmtFile: null,
        });
    console.debug(`code_format ${file_path} done`);
}