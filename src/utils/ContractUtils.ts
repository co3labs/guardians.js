import LoggerInstance from "./Logger";
import { GASLIMIT_DEFAULT } from "./Constants";


/**
 * Estimates the gas used when a function would be executed on chain
 * @param {string} from account that calls the function
 * @param {Function} functionToEstimateGas function that we need to estimate the gas
 * @param {...any[]} args arguments of the function
 * @return {Promise<number>} gas cost of the function
 */
export async function estimateGas(
  from: string,
  functionToEstimateGas: Function,
  ...args: any[]
): Promise<any> {
  let estimatedGas = GASLIMIT_DEFAULT;
  try {
    estimatedGas = await functionToEstimateGas.apply(null, args).estimateGas(
      {
        from: from,
      },
      (err, estGas) => (err ? GASLIMIT_DEFAULT : estGas)
    );
  } catch (e) {
    LoggerInstance.error(`ERROR: Estimate gas failed!`, e);
  }
  return estimatedGas;
}
