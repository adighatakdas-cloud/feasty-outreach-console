import { ProxyAgent, request, type Dispatcher } from "undici";
import type { ExecutionRoute } from "./execution-engine";

export type RouteSecretResolver = (secretRef: string) => Promise<{ username?: string; password?: string } | undefined>;
export type RoutedRequest = { url: string; method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number };
export type RoutedResponse = { statusCode: number; headers: Record<string, string | string[] | undefined>; body: string; routeId: number };

function routeUrl(route: ExecutionRoute, credentials?: { username?: string; password?: string }) {
  const auth = credentials?.username ? `${encodeURIComponent(credentials.username)}:${encodeURIComponent(credentials.password ?? "") }@` : "";
  return `${route.protocol}://${auth}${route.host}:${route.port}`;
}

export function createRouteDispatcher(route: ExecutionRoute, credentials?: { username?: string; password?: string }): Dispatcher {
  if (route.protocol === "socks5") throw new Error("socks5_transport_requires_approved_runtime");
  return new ProxyAgent(routeUrl(route, credentials));
}

export async function requestThroughRoute(route: ExecutionRoute, input: RoutedRequest, resolveSecret: RouteSecretResolver): Promise<RoutedResponse> {
  const credentials = route.secretRef ? await resolveSecret(route.secretRef) : undefined;
  const response = await request(input.url, {
    dispatcher: createRouteDispatcher(route, credentials),
    method: input.method ?? "GET",
    headers: input.headers,
    body: input.body,
    headersTimeout: input.timeoutMs ?? 15_000,
    bodyTimeout: input.timeoutMs ?? 15_000,
  });
  return { statusCode: response.statusCode, headers: response.headers, body: await response.body.text(), routeId: route.id };
}
