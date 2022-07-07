import * as tsfmt from "typescript-formatter";




export const code_format = (file_path : string) =>{
    tsfmt
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
        })
        .then(result =>{
            console.log(`code_format path:${file_path} result: ${JSON.stringify(result)}`);
        });
}