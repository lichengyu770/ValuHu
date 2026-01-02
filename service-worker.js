// 使用Workbox库实现Service Worker资源缓存
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
);

// 检查Workbox是否加载成功
if (workbox) {
  console.log('Workbox 加载成功，开始配置缓存策略');

  // 设置缓存版本，更新时修改此值可以触发缓存更新
  const CACHE_VERSION = 'v1';
  const CORE_ASSETS_CACHE_NAME = `core-assets-${CACHE_VERSION}`;
  const IMAGES_CACHE_NAME = `images-${CACHE_VERSION}`;
  const API_CACHE_NAME = `api-cache-${CACHE_VERSION}`;

  // 预缓存核心静态资源（安装阶段）
  workbox.precaching.precacheAndRoute([
    // 核心HTML文件
    { url: '/worker-import-demo.html', revision: CACHE_VERSION },
    { url: '/index.html', revision: CACHE_VERSION },
    // 添加其他核心HTML文件

    // 核心CSS文件
    { url: '/lib/styles.css', revision: CACHE_VERSION },
    { url: '/src/App.css', revision: CACHE_VERSION },
    { url: '/src/index.css', revision: CACHE_VERSION },

    // 核心JS文件
    { url: '/main.js', revision: CACHE_VERSION },
    { url: '/lib/main.js', revision: CACHE_VERSION },

    // 关键图片资源
    // 可以添加必要的图片路径
  ]);

  // 缓存CSS文件 - 缓存优先策略
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'style',
    new workbox.strategies.CacheFirst({
      cacheName: CORE_ASSETS_CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
        }),
      ],
    })
  );

  // 缓存JavaScript文件 - 缓存优先策略，但添加后台同步更新
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: CORE_ASSETS_CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 40,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
        }),
      ],
    })
  );

  // 缓存图片 - 缓存优先策略
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: IMAGES_CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
        }),
      ],
    })
  );

  // 对于API请求 - 网络优先策略，但离线时返回缓存
  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === self.location.origin && url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: API_CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1天
        }),
      ],
    })
  );

  // HTML导航请求 - 网络优先，但离线时返回缓存的主页
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: CORE_ASSETS_CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 1 * 24 * 60 * 60, // 1天
        }),
      ],
      // 网络失败时返回缓存的主页
      fallback: () => caches.match('/index.html'),
    })
  );

  // 离线页面支持
  workbox.routing.setCatchHandler(({ event }) => {
    switch (event.request.destination) {
      case 'document':
        return caches.match('/index.html') || Response.error();
      case 'image':
        // 可以返回一个默认占位图片
        return Response.error();
      case 'script':
      case 'style':
        return Response.error();
      default:
        return Response.error();
    }
  });

  // 后台同步 - 用于在网络恢复时同步数据
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
      event.waitUntil(syncDataWithServer());
    }
  });

  // 实现数据同步功能
  async function syncDataWithServer() {
    try {
      // 检查网络连接
      const networkResponse = await fetch('/api/sync-status');
      if (networkResponse.ok) {
        // 这里可以实现具体的数据同步逻辑
        console.log('数据同步成功');
      }
    } catch (error) {
      console.error('数据同步失败:', error);
    }
  }

  // 推送通知支持 - 增强版，支持VAPID验证
  self.addEventListener('push', (event) => {
    try {
      // 尝试解析JSON数据，如果失败则使用默认消息
      const data = event.data?.json() || {
        title: '系统通知',
        body: '您有一条新消息',
      };

      const options = {
        body: data.body || '有新消息',
        icon: '/src/assets/images/icon.png', // 通知图标
        badge: '/src/assets/images/badge.png', // 通知徽章
        vibrate: [100, 50, 100], // 振动模式
        data: {
          url: data.url || '/',
          timestamp: Date.now(),
        },
        actions: data.actions || [],
        tag: data.tag || 'default-tag', // 用于分组通知
        renotify: data.renotify || false,
        requireInteraction: data.requireInteraction || false,
      };

      event.waitUntil(
        self.registration.showNotification(
          data.title || '房产数据管理系统',
          options
        )
      );
    } catch (error) {
      console.error('推送通知处理错误:', error);

      // 降级为简单文本通知
      const fallbackOptions = {
        body: '您有一条新消息',
        icon: '/src/assets/images/icon.png',
      };

      event.waitUntil(
        self.registration.showNotification('房产数据管理系统', fallbackOptions)
      );
    }
  });

  // 点击通知打开对应页面 - 增强版，支持多窗口和现有窗口聚焦
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = new URL(event.notification.data.url, self.location.origin)
      .href;

    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // 检查是否已经有打开的窗口
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // 如果没有打开的窗口，则打开新窗口
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  });

  // 关闭通知事件
  self.addEventListener('notificationclose', (event) => {
    // 可以在这里记录通知被关闭的事件
    console.log('通知被关闭:', event.notification.data);
  });

  // 后台同步 - 推送订阅变更同步
  self.addEventListener('sync', (event) => {
    if (event.tag === 'update-push-subscription') {
      event.waitUntil(updatePushSubscriptionWithServer());
    }
  });

  // 更新推送订阅到服务器
  async function updatePushSubscriptionWithServer() {
    try {
      const subscription =
        await self.registration.pushManager.getSubscription();
      if (subscription) {
        // 这里应该发送订阅信息到服务器
        const subscriptionJson = JSON.stringify(subscription);
        console.log('推送订阅信息:', subscriptionJson);

        // 实际应用中应替换为真实的API端点
        const response = await fetch('/api/push-subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: subscriptionJson,
        });

        if (response.ok) {
          console.log('推送订阅已更新到服务器');
        } else {
          console.error('推送订阅更新失败:', await response.text());
        }
      }
    } catch (error) {
      console.error('推送订阅同步失败:', error);
    }
  }

  // 注册同步事件监听器
  self.addEventListener('sync', (event) => {
    if (event.tag === 'push-subscription-sync') {
      event.waitUntil(updatePushSubscriptionWithServer());
    }
  });

  // 检查浏览器是否支持Workbox
  if (false) {
    // 这里可以添加额外的Workbox配置
  } else {
    console.error('Workbox 加载失败，无法启用离线功能');

    // 降级处理：简单的缓存实现
    const FALLBACK_CACHE = 'fallback-cache-v1';

    // 安装阶段 - 缓存基本资源
    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches
          .open(FALLBACK_CACHE)
          .then((cache) => {
            return cache.addAll(['/worker-import-demo.html', '/index.html']);
          })
          .then(() => self.skipWaiting())
      );
    });

    // 激活阶段 - 清理旧缓存
    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches
          .keys()
          .then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== FALLBACK_CACHE) {
                  return caches.delete(cacheName);
                }
              })
            );
          })
          .then(() => self.clients.claim())
      );
    });

    // 请求处理 - 简单的缓存优先策略
    self.addEventListener('fetch', (event) => {
      event.respondWith(
        caches.match(event.request).then((response) => {
          // 如果缓存命中，返回缓存的响应
          if (response) {
            return response;
          }

          // 否则尝试从网络获取
          return fetch(event.request)
            .then((response) => {
              // 检查响应是否有效
              if (
                !response ||
                response.status !== 200 ||
                response.type !== 'basic'
              ) {
                return response;
              }

              // 克隆响应，因为响应流只能使用一次
              const responseToCache = response.clone();

              // 将响应添加到缓存
              caches.open(FALLBACK_CACHE).then((cache) => {
                cache.put(event.request, responseToCache);
              });

              return response;
            })
            .catch(() => {
              // 网络请求失败且无缓存时的降级处理
              if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
              }
            });
        })
      );
    });
  }
}
