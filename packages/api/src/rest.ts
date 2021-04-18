let apiPrefix = ''
let authorizationJwt: string | undefined = undefined

export const inferAPIPrefix = (hostname? : string) => {
  if (!hostname && typeof window !== 'undefined') {
    ({ hostname } = window.location)
  }
  if (hostname) {
    if (hostname.includes('vramework')) {
      setAPIPrefix('//api.vramework.com')
    } else {
      setAPIPrefix('//localhost:4002')
    }
  }
}

export const setAPIPrefix = (prefix: string) => {
  apiPrefix = prefix
}

export const setAuthorizationJWT = (jwt: string) => {
  authorizationJwt = jwt
}

async function action<R>(method: string, url: string, body: any, hasResponseBody?: true): Promise<R>
async function action(method: string, url: string, body: any, hasResponseBody?: false): Promise<void>
async function action<R>(method: string, url: string, body: any, hasResponseBody = true): Promise<R | void> {
  const data = JSON.stringify(body)

  let headers: Record<string, string> = { 'content-type': 'application/json' }
  if (authorizationJwt) {
    headers.Authorizaton = `Basic ${authorizationJwt}`
  }
  try {
    const response = await fetch(`${apiPrefix}/${url}`, {
      method,
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers,
      body: data,
    })
    if (response.status >= 400) {
      throw response
    }
    if (hasResponseBody) {
      return await response.json()
    }
  } catch (e) {
    // This is a 404
    throw e
  }
}

export async function post<R>(url: string, data: any, hasResponseBody?: boolean): Promise<R>
export async function post(url: string, data: any, hasResponseBody?: false): Promise<void>
export async function post<R>(url: string, data: any, hasResponseBody = true): Promise<R | void> {
  if (hasResponseBody) {
    return await action('POST', url, data, true)
  }
  await action('POST', url, data, false)
}

export async function patch<R>(url: string, data: any, hasResponseBody?: boolean): Promise<R>
export async function patch(url: string, data: any, hasResponseBody?: false): Promise<void>
export async function patch<R>(url: string, data: any, hasResponseBody = true): Promise<R | void> {
  if (hasResponseBody) {
    return await action('PATCH', url, data, true)
  }
  await action('PATCH', url, data, false)
}

export async function get<R>(
  url: string,
  query?: Record<string, string | number | undefined>,
  hasResponseBody?: boolean,
): Promise<R>
export async function get(
  url: string,
  query?: Record<string, string | number | undefined>,
  hasResponseBody?: boolean,
): Promise<void>
export async function get<T>(
  url: string,
  query: Record<string, string | number | undefined> = {},
  hasResponseBody = true,
): Promise<T | undefined> {
  let uri = `${apiPrefix}/${url}`
  if (query) {
    // removes all the undefined
    const params = new URLSearchParams(JSON.parse(JSON.stringify(query)))
    uri = `${apiPrefix}/${url}?${params}`
  }
  const response = await fetch(uri, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  })
  if (response.status > 400) {
    throw response
  }
  if (hasResponseBody) {
    try {
      return await response.json()
    } catch (e) {
      throw 'Unable to parse json response'
    }
  }
  return undefined
}

export async function head(url: string, query?: Record<string, string>): Promise<number> {
  let uri = `${apiPrefix}/${url}`
  if (query) {
    const params = new URLSearchParams(query)
    uri = `${apiPrefix}/${url}?${params}`
  }
  const response = await fetch(uri, {
    method: 'HEAD',
    mode: 'cors',
    credentials: 'include',
  })
  return response.status
}

export async function del(url: string): Promise<void> {
  const response = await fetch(`${apiPrefix}/${url}`, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
  })
  if (response.status > 400) {
    throw 'Didnt happen'
  }
}
