
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJMxPW9+xXr1j/MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0wLTczODZ3Zi51cy5hdXRoMC5jb20wHhcNMjEwOTE3MDgyMjQ4WhcN
MzUwNTI3MDgyMjQ4WjAkMSIwIAYDVQQDExlkZXYtMC03Mzg2d2YudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8AcvPjLL4qsBawcg
eIg4kv3vCg0ZkO1COMKxCUwr/HLgAV3NNq6cDLa0yMasVGe0CPt8KX16OOk2wpL0
6xO2xZtTjZDcqKteRgColokM8jd06t/tz7TTjoN8EQDgiSi48UVrg3vc/D5GqxCM
vom1np+irUtOjWsvxmRmKv7Nva73SsZEhSUp7Npda3YMaIhWBbr3Al4+hqhlg1tm
/8X2fVjC3B+VabA2eo7Qjtri/HvF8k7pyHdqRILdnpkltyRXXAuuO8PatCx8dw0Z
otMgL0l+enTBEIsTRih5CI6eqPSITbPhUu73aeBbmLKGfX86eG1zTeKw1+X3kAOd
xqZzfQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTh83N9asYM
/ky5K+On9fv6oP2OnTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AJwcCFmPqcds/H7SMxNDkMe/e2antoFqV/lM4XytjKSQmn/wo01BKqtYbP/TK4T9
ZhG+Eru97ai7Uxa4/ZAxeqj2a72s32H4COw8h1/VzyrwT2gMNOEh4KlxA94sXRxw
PFcscOXQah/e3gEP9WaVWxENhenvz2tlSMNIIg8rtFYpe9YWXuA0kM7PHD9QVkNM
b4PmIgYrUOw/4XPs9MRV+EbpAzS9hnTEkuakwGW0TvaH8+uMVCpUCu10FA4KyV6o
7K+rUQNbqbE0G4VaSI3kOZ9y+ftekr1Mf+uXwMkfw87AMaduGpQrCXTjJ3HAtUNG
7r4OJHWAeNUuM5n2+jjFQVw=
-----END CERTIFICATE-----`

const logger = createLogger('auth')

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
