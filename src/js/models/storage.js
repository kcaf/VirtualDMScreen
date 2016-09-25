var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

//var open = indexedDB.open("VirtualDMScreen", 1);

// Create the schema
open.onupgradeneeded = function() {
    var db = open.result;
    var store = db.createObjectStore("ViewModels", {keyPath: "id"});

    if(!store.objectStoreNames.contains("Combat"))
        store.createIndex("Combat");
    if(!store.objectStoreNames.contains("Game"))
        store.createIndex("Game");
    if(!store.objectStoreNames.contains("Loot"))
        store.createIndex("Loot");
    if(!store.objectStoreNames.contains("NPCs"))
        store.createIndex("NPCs");
    if(!store.objectStoreNames.contains("Players"))
        store.createIndex("Players");
    if(!store.objectStoreNames.contains("Roll"))
        store.createIndex("Roll");
    if(!store.objectStoreNames.contains("Spells"))
        store.createIndex("Spells");
};

open.onsuccess = function() {
    // Start a new transaction
    var db = open.result;
    var tx = db.transaction("ViewModels", "readwrite");
    var store = tx.objectStore("ViewModels");


    var index = store.index("NameIndex");

    // Add some data
    //store.put({id: 12345, name: {first: "John", last: "Doe"}, age: 42});
    //store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});
    
    // Query the data
    //var getJohn = store.get(12345);
    //var getBob = index.get(["Smith", "Bob"]);

    getJohn.onsuccess = function() {
        console.log(getJohn.result.name.first);  // => "John"
    };

    getBob.onsuccess = function() {
        console.log(getBob.result.name.first);   // => "Bob"
    };

    // Close the db when the transaction is done
    tx.oncomplete = function() {
        db.close();
    };
};

open.onerror = function(error) {
    //console.log(error);
    //alert("Database Error");
};