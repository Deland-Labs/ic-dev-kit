import * as tsfmt from "typescript-formatter";
import logger from "node-color-log";
import {exec} from "shelljs";




export const code_format = async (file_path : string) =>{
    process.cwd
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
        logger.debug(result[file_path]);
    });
}

export const code_format2 = (file_path : string) =>{
    let result = exec(`npx eslint --fix --ext .ts ${file_path}`, { silent: true });
    logger.debug(`code_format2 : ${result.stderr}`);
}