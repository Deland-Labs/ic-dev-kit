import { Argument, Command, OptionValues } from 'commander';
import { execute_task_update_did } from './bin_scripts/ic-update-did';
import { execute_task_init_dev_kit } from './bin_scripts/ic-init';
import { execute_task_show_principal } from './bin_scripts/ic-show-principal';
import { execute_task_generate } from './bin_scripts/ic-generate';
import { execute_task_init_identity } from './bin_scripts/ic-init-identity';
import { execute_task_build_all } from './bin_scripts/ic-build-all';
import { execute_task_pack } from './bin_scripts/ic-pack';
import { DEFAULT_PACKAGE_SCOPE, DEFAULT_PACKAGE_VERSION } from './src/defaults';
import logger from 'node-color-log';
const program = new Command();

program
    .command('update-did')
    .description('update did files')
    .action(async () => {
        await execute_task_update_did();
    });


program
    .command('init')
    .description('init ic-dev-kit')
    .action(() => {
        execute_task_init_dev_kit();
    });

program
    .command('show-principal')
    .description('show principal')
    .action(() => {
        execute_task_show_principal();
    });

program
    .command('generate')
    .description('generate ts bindings from did')
    .action(() => {
        execute_task_generate();
    });

program
    .command('init-identity')
    .description('load identities from pem files')
    .action(() => {
        execute_task_init_identity();
    });

program
    .command('build-all')
    .description('build all canisters')
    .action(() => {
        execute_task_build_all();
    });

program
    .command('pack')
    .description('pack all canisters')
    .option('-p, --package-version <package-version>', 'version of package', DEFAULT_PACKAGE_VERSION)
    .option('-s, --package-scope <package-scope>', 'scope of package', DEFAULT_PACKAGE_SCOPE)
    .action((options, command) => {
        const input = {
            packageScope: options.packageScope,
            version: options.packageVersion
        };
        logger.info(input);
        execute_task_pack(input);
    });


program.parse(process.argv);