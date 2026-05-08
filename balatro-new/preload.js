const _originalOpen = indexedDB.open.bind(indexedDB);

async function preloadSaves() {
    const DIR_PERMS = 16832;
    const FILE_PERMS = 33152;
    const SETTINGS_PERMS = 33206;

    const save_data_id = "Balatro_vanilla_/home/web_user/love";

    const request = _originalOpen(save_data_id);

    const db = await new Promise((resolve, reject) => {
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore("FILE_DATA");
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    // Check if meta.jkr already exists
    const existing = await new Promise((resolve) => {
        const tx = db.transaction("FILE_DATA", "readonly");
        const store = tx.objectStore("FILE_DATA");
        const req = store.get("/home/web_user/love/game/1/meta.jkr");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });

    if (existing) {
        console.log("Save already exists, skipping preload.");
        db.close();
        return;
    }

    const files = [
        { key: "/home/web_user/love/game/settings.jkr", url: "save_data/settings.jkr", mode: SETTINGS_PERMS },
        { key: "/home/web_user/love/game/1/meta.jkr",    url: "save_data/1/meta.jkr",    mode: FILE_PERMS },
        { key: "/home/web_user/love/game/1/profile.jkr", url: "save_data/1/profile.jkr", mode: FILE_PERMS },
        { key: "/home/web_user/love/game/1/save.jkr",    url: "save_data/1/save.jkr",    mode: FILE_PERMS },
    ];

    const entries = await Promise.all(files.map(async ({ key, url, mode }) => {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        return { key, mode, contents: new Int8Array(buf), timestamp: new Date() };
    }));

    const tx1 = db.transaction("FILE_DATA", "readwrite");
    const store1 = tx1.objectStore("FILE_DATA");
    await new Promise((resolve, reject) => {
        const cursor = store1.openCursor();
        cursor.onsuccess = (event) => {
            const c = event.target.result;
            if (c) { store1.delete(c.key); c.continue(); }
            else resolve();
        };
        cursor.onerror = () => reject();
    });

    const tx2 = db.transaction("FILE_DATA", "readwrite");
    const store2 = tx2.objectStore("FILE_DATA");

    store2.add({ mode: DIR_PERMS, timestamp: new Date() }, "/home/web_user/love/game");
    store2.add({ mode: DIR_PERMS, timestamp: new Date() }, "/home/web_user/love/game/1");

    for (const { key, mode, contents, timestamp } of entries) {
        store2.add({ mode, timestamp, contents }, key);
    }

    await new Promise((resolve, reject) => {
        tx2.oncomplete = resolve;
        tx2.onerror = () => reject(tx2.error);
    });

    db.close();
    console.log("Saves preloaded!");
}

preloadSaves();