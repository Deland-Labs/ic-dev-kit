import * as tsfmt from "typescript-formatter";
import logger from "node-color-log";




export const code_format = async (file_path : string) =>{
    await tsfmt
        .processFiles([file_path], {
            dryRun: true,
            replace: true,
            verify: true,
            tsconfig: true,
            tsconfigFile: '../../tsconfig.json',
            tslint: false,
            tslintFile: null,
            editorconfig: true,
            vscode: false,
            vscodeFile: null,
            tsfmt: false,
            tsfmtFile: null,
        }).then(result =>{
        logger.debug(result["./index.ts"].dest);
    });
}