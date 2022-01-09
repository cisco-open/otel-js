import {diag} from "@opentelemetry/api";

export interface Options {
    FSOEndpoint: string,
    serviceName: string,
    FSOToken: string
}

/**
 * Config all OTel & FSO default values.
 * First, take from userOptions/Env variables and at last, set default options if
 * the user didn't specified any.
 * @param options Option received from the User
 */
export function _configDefaultOptions(
    options: Options
) :Options | undefined {
    options.FSOToken =
        options.FSOToken || process.env.FSO_TOKEN || '';

    if (!options.FSOToken) {
        diag.error('FSO token must be passed into initialization')
        return undefined;
    }

    options.FSOEndpoint =
        options.FSOToken || process.env.FSO_ENDPOINT || 'http://localhost:4713'

    options.serviceName =
        options.serviceName || process.env.SERVICE_NAME || 'application'

    return options
}
