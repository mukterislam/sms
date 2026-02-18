const CACHE_NAME = "my-chart-cache-v3"; // ভার্সন পরিবর্তন করেছি যাতে নতুন করে আপডেট হয়

// ১. এখানে শুধু সেই ফাইলগুলোই রাখবেন যা আপনার ফোল্ডারে সত্যিই আছে।
// style.css বাদ দিয়েছি কারণ আপনার CSS HTML-এর ভেতরেই আছে।
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// 1. Install Event
self.addEventListener("install", (event) => {
    self.skipWaiting(); // নতুন সার্ভিস ওয়ার্কার দ্রুত চালু করার জন্য
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching assets...");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Activate Event
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("Deleting old cache:", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. Fetch Event (নিরাপদ লজিক)
self.addEventListener("fetch", (event) => {
    // শুধু GET রিকোয়েস্ট ক্যাশ করব (Firebase বা POST রিকোয়েস্ট ক্যাশ করলে এরর হয়)
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // রেসপন্স ভ্যালিড কিনা চেক করা
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // অফলাইন হলে ক্যাশ থেকে লোড করবে
                return caches.match(event.request);
            })
    );
});
