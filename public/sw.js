const CACHE_NAME = "ieq-pituacu-v1";

// Arquivos essenciais que ficam disponíveis offline
const ASSETS = [
    "/",
    "/index.html",
    "/icon-192.png",
    "/icon-512.png",
];

// Instala o SW e armazena os assets no cache
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Remove caches antigos ao ativar nova versão
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Estratégia: Network First (tenta buscar da rede, cai no cache se offline)
self.addEventListener("fetch", (event) => {
    // Ignora requisições que não sejam GET ou que não sejam http/https
    if (event.request.method !== "GET") return;
    if (!event.request.url.startsWith("http")) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Only cache complete (200) responses — skip 206 Partial Content
                if (response && response.status === 200 && response.type === "basic") {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(async () => {
                const cached = await caches.match(event.request);
                if (cached) return cached;

                // Fallback para navegações SPA: serve o index.html do cache
                if (event.request.mode === "navigate") {
                    const index = await caches.match("/index.html");
                    if (index) return index;
                }

                // Sempre devolve uma Response válida para não quebrar o respondWith
                return new Response("Offline", {
                    status: 503,
                    statusText: "Service Unavailable",
                    headers: { "Content-Type": "text/plain" },
                });
            })
    );
});