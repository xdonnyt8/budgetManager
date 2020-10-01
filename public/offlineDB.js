let db;

let request = indexedDB.open("budget", 1);

request.onupgradeneeded = event => {
    const newDB = event.target.result
    newDB.createObjectStore("pending", { autoIncrement: true })
}
request.onsuccess = event => {
    db = event.target.result;

    if (navigator.onLine) {
        checkDB()
    }
}

request.onerror = event => {
    console.log("You have got yourself an error" + event.target.errorCode)
}


checkDB = () => {
    const trans = db.transaction(["pending"], "readwrite")
    const store = trans.objectStore("pending")
    const all = store.getAll();

    all.onsuccess = () => {
        if (all.result.length > 0) {
            fetch("./api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(all.result),
                header: {
                    Accept: "application/json, text/plain, */*", "Content-Type": "application/json"
                }
            }).then(res => res.json()).then(() => {
                const trans = db.transaction(["pending"], "readwrite")
                const store = trans.ObjectStore("pending")

                store.clear();
            })
        }
    }

}

saveRecord = record => {
    const trans = db.transaction(["pending"], "readwrite")
    const store = trans.ObjectStore("pending")

    store.add(record);
}

window.addEventListener("online", checkDB);
