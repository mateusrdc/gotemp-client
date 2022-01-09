class ApiInterface {
    constructor(url, key) {
        this.url = url;
        this.key = key;
    }

    async _doRequest(method, url, data = null) {
        const body = data !== null ? (typeof data === "string" ? data : JSON.stringify(data)) : null

        return await fetch(this.url + url, {
            method,
            headers: {
                "Authorization": "bearer " + this.key,
                "Content-Type": "application/json"
            },
            body
        }).then(async r => {
            if (r.ok) {
                const data = await r.json();

                if (!data.success) {
                    throw data;
                } else {
                    return data;
                }
            } else {
                const data = await r.json();

                console.log("Error doing " + method + " on " + url + ", response:", data);
                throw data;
            }
        })
    }

    async GET(url) {
        return await this._doRequest("GET", url)
    }

    async POST(url, data) {
        return await this._doRequest("POST", url, data)
    }

    async PUT(url, data) {
        return await this._doRequest("PUT", url, data)
    }

    async DELETE(url, data) {
        return await this._doRequest("DELETE", url, data)
    }
}

async function checkServer(url, key) {
    return await fetch(url + "/status", {headers: {"Authorization": "bearer " + key}})
        .then(async r => {
            if (!r.ok) {
                return false;
            }

            const data = await r.json();

            if (data.success) {
                return data;
            } else {
                console.log(data);
                return false;
            }
        })
        .catch(e => {
            return false;
        });
}

async function testServerLogin() {
    const urlInput = document.querySelector("#server_address_input");
    const keyInput = document.querySelector("#server_key_input");
    let url = (urlInput.value.endsWith("/") ? urlInput.value.substring(0, urlInput.value.length - 1) : urlInput.value);

    if (!url.startsWith("http://") && !url.startsWith("https://"))
        url = "http://" + url;

    // Test connection
    const result = await app.tryConnect(url, keyInput.value);

    if (result) {
        localStorage.setItem("server_address", url);
        localStorage.setItem("server_key", keyInput.value);
    } else {
        urlInput.value = "";
        keyInput.value = "";
    }
}

async function saveEditedMailbox(mailbox) {
    return await app.api.PUT(`/mailboxes/${mailbox.id}`, mailbox)
        .then(_ => true)
        .catch(_ => false);
}

async function _deleteEmails(mailbox_id, email_list) {
    return await app.api.DELETE(`/mailboxes/${mailbox_id}/mails`, email_list)
        .then(_ => true)
        .catch(_ => false);
}

function notify(text, status = "primary") {
    return UIkit.notification(text, { status, pos: "bottom-right"})
}

function timeago(timestr) {
    const now = Date.now();
    const date = new Date(timestr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // If less than 24 hours old
    if ((now - date.valueOf()) <= (24 * 3600000)) {
        return date.toLocaleTimeString(navigator.language, { timeStyle: "short" });
    } else {
        return date.toLocaleDateString(navigator.language, { dateStyle: "medium" });
    }
}

function dec2hex(dec) {
    return dec.toString(16).padStart(2, "0")
}

function generateRandomString(len) {
    const arr = new Uint8Array((len || 40) / 2)
    crypto.getRandomValues(arr)

    return Array.from(arr, dec2hex).join("");
}

function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};

function browserFormatDate(date, include_time) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    if (include_time) {
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");

        return `${year}-${month}-${day}T${hour}:${minute}`;
    } else {
        return `${year}-${month}-${day}`;
    }
}

function getDefaultModalDate() {
    const date = new Date();
    date.setHours(date.getHours() + 24);

    return browserFormatDate(date, false);
}