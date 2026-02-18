const CACHE_NAME = "my-chart-cache-v2";

const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// 1. Install Event: ব্রাউজারে ক্যাশ তৈরি করা
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching assets...");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Activate Event: পুরনো ক্যাশ ডিলিট করা (যদি ভার্সন চেঞ্জ হয়)
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// 3. Fetch Event: ডেটা লোড করার লজিক (Network First, then Cache)
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // ইন্টারনেট থাকলে রেসপন্স রিটার্ন করবে এবং ক্যাশ আপডেট করবে
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // ইন্টারনেট না থাকলে ক্যাশ থেকে ফাইল দেখাবে
                return caches.match(event.request);
            })
    );
});
