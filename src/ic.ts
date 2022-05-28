import { Argument, Command, OptionValues } from 'commander';
import { execute_task_update_did } from './bin_scripts/ic-update-did';
import { execute_task_init_dev_kit } from './bin_scripts/ic-init';
import { execute_task_show_principal } from './bin_scripts/ic-show-principal';
import { execute_task_generate } from './bin_scripts/ic-generate';
import { execute_task_init_identity } from './bin_scripts/ic-init-identity';
import { execute_task_build_all } from './bin_scripts/ic-build-all';
import { execute_task_pack } from './bin_scripts/ic-pack';
import { DEFAULT_BUILD_ENV_NAME, DEFAULT_DECLARATIONS_OUT_DIR, DEFAULT_PACKAGE_SCOPE, DEFAULT_PACKAGE_VERSION, DEFAULT_PRODUCTION_ENV } from './src/defaults';
import logger from 'node-color-log';
import { execute_task_get_account_id } from './bin_scripts/ic-get-account-id';
import { ICPackInput } from './src/types';
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
    .description('show principal from pem file')
    .option('-n, --name <name>', 'name of the principal')
    .action((options, command) => {
        const input = {
            name: options.name
        }
        execute_task_show_principal(input);
    });

program
    .command('generate')
    .description('generate ts bindings from did')
    .option('-o, --declarations-out-dir <declarationsOutDir>', 'output directory for generated ts bindings', DEFAULT_DECLARATIONS_OUT_DIR)
    .action((options, command) => {
        const input = {
            declarationsOutDir: options.declarationsOutDir
        };
        logger.debug(input);
        execute_task_generate(input);
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
    .option('-n, --canister-env-name <canister-env-name>', 'enviroment variable name to be set before run `dfx build`', DEFAULT_BUILD_ENV_NAME)
    .option('-e, --canister-env <canister-env>', 'canister env to pack, if not specified, pack all canisters', '')
    .option('-r, --production-canister-env <production-canister-env>', 'canister env to pack in production mode.', DEFAULT_PRODUCTION_ENV)
    .option('--publish', 'publish npm package', false)
    .option('--zip', 'zip package', false)
    .action((options, command) => {
        const input: ICPackInput = {
            packageScope: options.packageScope,
            version: options.packageVersion,
            canisterEnv: options.canisterEnv,
            canisterEnvName: options.canisterEnvName,
            productionCanisterEnv: options.productionCanisterEnv,
            zip: options.zip,
            publish: options.publish
        };
        logger.debug(input);
        execute_task_pack(input);
    });

program
    .command('get-account-id')
    .description('get account id from a principal')
    .argument('<principal>', 'principal')
    .action((principal) => { execute_task_get_account_id(principal) })

program.parse(process.argv);