// ============================================
// ESCOLA CLOUD - SERVICE WORKER (PWA)
// Para funcionamento offline e cache
// ============================================

const CACHE_NAME = "escola-cloud-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/escola/index.html",
  "/admin/login.html",
  "/admin/index.html",
  "/diretor/login.html",
  "/diretor/index.html",
  "/professor/login.html",
  "/professor/index.html",
  "/secretario/login.html",
  "/secretario/index.html",
  "/aluno/login.html",
  "/aluno/index.html",
  "/assets/css/style.css",
  "/assets/css/admin.css",
  "/assets/css/diretor.css",
  "/assets/css/professor.css",
  "/assets/css/secretario.css",
  "/assets/css/aluno.css",
  "/assets/css/escola.css",
  "/assets/js/supabase.js",
  "/assets/js/escola.js",
  "/assets/js/admin.js",
  "/assets/js/diretor.js",
  "/assets/js/professor.js",
  "/assets/js/secretario.js",
  "/assets/js/aluno.js",
  "/manifest.json",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache aberto");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.log("Erro ao cachear:", err)),
  );
});

// Ativação - limpar caches antigos
self.addEventListener("activate", (event) => {
  console.log("Service Worker ativado");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Removendo cache antigo:", cache);
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }),
  );
});

// Notificações push (opcional)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || "Nova notificação",
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/icons/icon-72.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
    },
  };
  event.waitUntil(
    self.registration.showNotification(data.title || "Escola Cloud", options),
  );
});

// Clique na notificação
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
