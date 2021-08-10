// standardizing for different browsers in case of indexedDB object
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;

// tells indexedDb to open database called "ez-budget"
const request = indexedDB.open("ez-budget", 1);

// set up your object store called "pending"
request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

// if the request was successful (internet restored), queries as usual
request.onsuccess = ({ target }) => {
  db = target.result;
  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

// error handler
request.onerror = function(event) {
  console.log("Error " + event.target.errorCode);
};

// called when it's time to save data to the indexedDb
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

// runs when internet connection is working again
// sends post request to the server with all the saved data so that the data 
// can be synced with the server, and then it wipes out the existing indexedDb
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {        
        return response.json();
      })
      .then(() => {
        // delete records if successful
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);