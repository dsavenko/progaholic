var GITHUB_EVENTS_URL = 'https://api.github.com/users/dsavenko/events'

function loadUrl(url, callback) {
    var x = new XMLHttpRequest()
    x.open('GET', url)
    x.onload = function() {
        if (x.status == 200) {
            callback(undefined, x.responseText)
        } else {
            console.log('status: ' + x.statusText)
            callback(x.statusText)
        }
    }
    x.onerror = function(e) {
        callback(e)
    }
    x.send()
}

function loadJson(url, callback) {
    loadUrl(url, function(e, txt) {
        if (e) {
            callback(e)
        } else {
            callback(undefined, JSON.parse(txt))
        }
    })
}

function sameDay(d1, d2) {
    return d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear()
}

function countTodayEvents(events) {
    var now = new Date()
    var ret = 0
    for (var i = 0; i < events.length; ++i) {
        var created = new Date(events[i].created_at)
        if (!sameDay(now, created)) {
            break
        }
        ++ret
    }
    return ret
}

function eventColor(count) {
    if (count <= 0) {
        return '#ebedf0'
    } else if (0 < count && count <= 4) {
        return '#c6e48b'
    } else if (4 < count && count <= 6) {
        return '#7bc96f'
    } else if (6 < count && count <= 10) {
        return '#239a3b'
    } else {
        return '#196127'
    } 
}

xBrowser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('get_color' == request.name) {
        loadJson(GITHUB_EVENTS_URL, function(e, events) {
            if (e) {
                sendResponse({error: e})
            } else {
                var todayEvents = countTodayEvents(events)
                sendResponse({error: undefined, color: eventColor(todayEvents)})
            }
        })
        return true
    }
    return false
})
