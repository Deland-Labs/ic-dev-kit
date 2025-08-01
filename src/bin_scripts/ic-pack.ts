import fs from 'fs';
import archiver from 'archiver';
import {
  DfxJsonCanister,
  get_dfx_json,
  get_dfx_package_json,
  get_wasm_path,
  DEFAULT_DFX_PACKAGE_JSON_FILENAME
} from '../src/dfxJson';
import * as canister from '../src/canister';
import logger from 'node-color-log';
import shelljs from 'shelljs';
const { exec } = shelljs;
import { ICPackInput } from '../src/types';

const package_dir = 'package';

interface PackNpmClientInput {
  did_file_path: string;
  target_dir_path: string;
  name: string;
  version: string;
}

const ensure_dir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const templatesDir = (() => {
  // templates installed from node_modules
  const node_modules_templates = `./node_modules/@delandlabs/ic-dev-kit/ic_npm_templates`;
  if (fs.existsSync(node_modules_templates)) {
    return node_modules_templates;
  }

  let templates_dir = `ic_npm_templates`;
  const max_retry = 5;
  for (let i = 0; i < max_retry; i++) {
    if (fs.existsSync(templates_dir)) {
      return templates_dir;
    }
    templates_dir = `../${templates_dir}`;
  }
})();

const pack_npm_client = (input: PackNpmClientInput) => {
  if (!fs.existsSync(input.did_file_path)) {
    logger.warn(`${input.did_file_path} not found`);
    return;
  }

  ensure_dir(input.target_dir_path);

  // dir starts from dist, so there is a ../
  const npm_client_template_dir = `${templatesDir}/npm_ts_client`;
  // copy all files from npm_client_template_dir to target_dir_path
  fs.cpSync(`${npm_client_template_dir}/`, `${input.target_dir_path}/`, { recursive: true });

  // update package.json
  const package_json = `${input.target_dir_path}/package.json`;
  const package_json_content = fs.readFileSync(package_json, 'utf-8');
  const package_json_content_obj = JSON.parse(package_json_content);
  package_json_content_obj.name = input.name;
  package_json_content_obj.version = input.version;
  fs.writeFileSync(package_json, JSON.stringify(package_json_content_obj, null, 2));

  const generate_bind = (target: string) => {
    let result = exec(`npx ic-didc bind ${input.did_file_path} --target ${target}`, { silent: true });
    if (result.code !== 0) {
      logger.error(`npm client generate bind error for ${input.did_file_path}: ${result.stdout}`);
      return '';
    }
    return result.stdout;
  };
  // generate index.ts from js binding
  const index_js = `${input.target_dir_path}/idl.ts`;
  const js = generate_bind('js');
  if (js) {
    fs.writeFileSync(index_js, js);
  }

  // generate index.d.ts
  const index_d_ts = `${input.target_dir_path}/interface.ts`;
  const d_ts = generate_bind('ts');
  if (d_ts) {
    fs.writeFileSync(index_d_ts, d_ts);
  }

  // generate index.did
  const index_did = `${input.target_dir_path}/index.did`;
  const did = generate_bind('did');
  if (did) {
    fs.writeFileSync(index_did, did);
  }

  // run tsc to build ts
  const tsc_result = exec(`cd ${input.target_dir_path} && npm run build`, { silent: false });
  if (tsc_result.code !== 0) {
    logger.error(`npm client tsc error for ${input.did_file_path}: ${tsc_result.stderr}`);
    return;
  }
};

interface PackNpmServerInput {
  did_file_path: string;
  wasm_file_path: string;
  target_dir_path: string;
  name: string;
  version: string;
}

const pack_npm_server = (input: PackNpmServerInput) => {
  if (!fs.existsSync(input.did_file_path)) {
    logger.warn(`${input.did_file_path} not found`);
    return;
  }

  if (!fs.existsSync(input.wasm_file_path)) {
    logger.warn(`${input.wasm_file_path} not found`);
    return;
  }

  ensure_dir(input.target_dir_path);

  // dir starts from dist, so there is a ../
  const npm_server_template_dir = `${templatesDir}/npm_server`;
  // copy all files from npm_server_template_dir to target_dir_path
  fs.cpSync(`${npm_server_template_dir}/`, `${input.target_dir_path}/`, { recursive: true });

  // update package.json
  const package_json = `${input.target_dir_path}/package.json`;
  const package_json_content = fs.readFileSync(package_json, 'utf-8');
  const package_json_content_obj = JSON.parse(package_json_content);
  package_json_content_obj.name = input.name;
  package_json_content_obj.version = input.version;
  fs.writeFileSync(package_json, JSON.stringify(package_json_content_obj, null, 2));

  fs.copyFileSync(input.wasm_file_path, `${input.target_dir_path}/index.wasm`);
  fs.copyFileSync(input.did_file_path, `${input.target_dir_path}/index.did`);
};

const build_all = async (buildContext: BuildContext) => {
  let out_dfx_json = {
    defaults: {
      build: {
        args: '',
        packtool: ''
      }
    },
    networks: {
      local: {
        bind: '127.0.0.1:8000',
        type: 'ephemeral'
      },
      ic: {
        providers: ['https://ic0.app'],
        type: 'persistent'
      }
    },
    version: 1
  };

  let canister_node = {};

  for (let name of Object.keys(buildContext.canisters)) {
    const canister = buildContext.canisters[name];
    if (canister.pack_config?.exclude_in_integration_package == true) {
      logger.debug(`package ${name} is exclude_in_integration_package`);
    } else {
      canister_node[name] = {
        candid: `assets/${name}.did`,
        wasm: `assets/${name}.wasm`,
        type: 'custom'
      };
    }
  }
  out_dfx_json['canisters'] = canister_node;

  // reset package_canister_env dir
  if (fs.existsSync(package_dir)) {
    fs.rmSync(package_dir, { recursive: true });
  }
  fs.mkdirSync(package_dir);

  // distinct canister_env
  let canister_envs = buildContext.canister_envs;

  // build each canister by each canister_env
  for (const canisterEnv of canister_envs) {
    // make a canister_env dif
    const canister_env_dir = `${package_dir}/${canisterEnv}`;
    fs.mkdirSync(canister_env_dir);

    const assert_dir = `${canister_env_dir}/assets`;
    ensure_dir(assert_dir);

    const isProductionEnv = canisterEnv == buildContext.icPackInput.productionCanisterEnv;
    logger.debug(`build canister_env ${canisterEnv}, isProductionEnv: ${isProductionEnv}`);

    for (let [name, canister_json] of Object.entries(buildContext.canisters)) {
      const wasm_path = get_wasm_path(name, canister_json);
      const did_path = canister_json.candid;
      // copy did and wasm to assets dir
      if (canister_json.pack_config?.exclude_in_integration_package == true) {
        logger.debug(`package ${name} is exclude_in_integration_package`);
      } else {
        canister.build(name, {
          canisterEnv: canisterEnv,
          canisterEnvName: buildContext.icPackInput.canisterEnvName
        });

        // copy wasm files to canister_env dir
        fs.copyFileSync(wasm_path, `${assert_dir}/${name}.wasm`);
        // copy did files to canister_env dir
        fs.copyFileSync(did_path, `${assert_dir}/${name}.did`);
      }
      {
        // out dfx.json
        const dest_dfx_json = `${canister_env_dir}/dfx.json`;
        fs.writeFileSync(dest_dfx_json, JSON.stringify(out_dfx_json, null, 2));
        logger.debug(`Created dfx.json for ${canisterEnv}`);
      }
      if (canister_json.pack_config?.exclude_in_package == true) {
        logger.debug(`package ${name} is exclude_in_package`);
      } else {
        const npm_dir = `${canister_env_dir}/npm`;
        const packageScope = buildContext.icPackInput.packageScope;
        ensure_dir(npm_dir);
        // build npm client
        {
          // npm client
          if (canister_json.pack_config?.pack_npm_client != false) {
            const packageName = isProductionEnv
              ? `@${packageScope}/${name}_client`
              : `@${packageScope}/${name}_${canisterEnv}_client`;
            const npm_client_input: PackNpmClientInput = {
              did_file_path: did_path,
              target_dir_path: `${npm_dir}/client/${name}`,
              name: packageName,
              version: buildContext.icPackInput.version
            };
            pack_npm_client(npm_client_input);
          }
        }
        // build npm server
        {
          if (canister_json.pack_config?.pack_npm_server != false) {
            const packageName = isProductionEnv
              ? `@${packageScope}/${name}_server`
              : `@${packageScope}/${name}_${canisterEnv}_server`;
            const npm_server_input: PackNpmServerInput = {
              did_file_path: did_path,
              wasm_file_path: wasm_path,
              target_dir_path: `${npm_dir}/server/${name}`,
              name: packageName,
              version: buildContext.icPackInput.version
            };
            pack_npm_server(npm_server_input);
          }
        }
      }
    }
  }
};

const clean = async () => {
  const found = fs.existsSync(package_dir);
  if (found) {
    logger.info('Cleaning package directory');
    fs.rmSync(package_dir, { recursive: true });
  }

  fs.mkdirSync(package_dir);
};

const check = async (buildContext: BuildContext) => {
  // ensure every wasm file in package_canister_env dir must be < 2MB, check recursive
  for (let canister_env of buildContext.canister_envs) {
    const canister_env_dir = `${package_dir}/${canister_env}/assets`;
    const files = fs.readdirSync(canister_env_dir);
    for (const file of files) {
      if (file.endsWith('.wasm')) {
        const file_path = `${canister_env_dir}/${file}`;
        const stat = fs.statSync(file_path);
        if (stat.size > 2 * 1024 * 1024) {
          logger.warn(`WASM file size of ${file} is ${stat.size} bytes, must be < 2MB`);
        }
      }
    }
  }

  logger.debug('Check done');
};

const create_zip = async (buildContext: BuildContext) => {
  // create zip file for each env
  for (const env of buildContext.canister_envs) {
    const env_dir = `${package_dir}/${env}`;
    const output_zip = fs.createWriteStream(`${env_dir}.zip`);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.pipe(output_zip);
    archive.directory(env_dir, false);
    await archive.finalize();

    logger.info(`Created zip file for ${env}`);
  }
};

const publishPackage = (buildContext: BuildContext) => {
  const publishComamnd = `yarn publish --frozen-lockfile --non-interactive --no-git-tag-version --no-commit-hooks`;
  for (const canister_env of buildContext.canister_envs) {
    const envNpmDir = `${package_dir}/${canister_env}/npm`;
    const categoryDirs = fs.readdirSync(envNpmDir);
    for (const category of categoryDirs) {
      const categoryDir = `${envNpmDir}/${category}`;
      const packageDirs = fs.readdirSync(categoryDir);
      for (const packageName of packageDirs) {
        const packageDir = `${categoryDir}/${packageName}`;
        logger.debug(`Publishing ${packageDir}`);
        let result = exec(`cd ${packageDir} && ${publishComamnd}`, { silent: true });
        if (result.code != 0) {
          logger.error(`Failed to publish ${packageDir}. Error: ${result.stderr}`);
        } else {
          logger.info(`Published ${packageDir}`);
        }
      }
    }
  }
};

interface BuildContext {
  icPackInput: ICPackInput;
  canisters: Map<string, DfxJsonCanister>;
  canister_envs: string[];
}

export const execute_task_pack = async (input: ICPackInput) => {
  const dfxJson = get_dfx_json();
  const dfxPackageJson = get_dfx_package_json();
  // join canisters keys as string
  const canisters_keys = Array.from(dfxJson.canisters.keys()).join(', ');
  logger.info(`There are canister listed in dfx.json: ${canisters_keys}`);

  // filter canister those not exclude in package
  const canisters = {};

  for (const [name, canister] of dfxJson.canisters.entries()) {
    canisters[name] = canister;
  }

  const all_envs = new Set(dfxPackageJson.envs.map((env) => env.canister_env));
  let canister_envs;
  if (input.canisterEnv) {
    if (!all_envs.has(input.canisterEnv)) {
      logger.error(`Canister env ${input.canisterEnv} not found in ${DEFAULT_DFX_PACKAGE_JSON_FILENAME}`);
      return;
    }
    canister_envs = [input.canisterEnv];
  } else {
    canister_envs = [...all_envs];
  }
  const buildContext: BuildContext = {
    icPackInput: input,
    canisters: canisters as Map<string, DfxJsonCanister>,
    canister_envs: canister_envs
  };
  logger.debug(`buildContext: ${JSON.stringify(buildContext, null, 2)}`);

  await clean();
  await build_all(buildContext);
  await check(buildContext);
  if (input.zip) {
    await create_zip(buildContext);
  }
  if (input.publish) {
    publishPackage(buildContext);
  }

  logger.info('execute_task_pack done');
};
