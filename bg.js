// MIT License
//
// Copyright (c) 2017 Dmitry Savenko (dsavenko.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var RELOAD_DATA_TIMEOUT_MIN = 5000
var RELOAD_DATA_TIMEOUT_REGULAR = 1000 * 60 * 6 // 6 mins
var RELOAD_DATA_TIMEOUT_MAX = 1000 * 60 * 60 // 1 hour

var GITHUB_EVENTS_URL = 'https://api.github.com/users/dsavenko/events'

var loadingUserData = false
var reloadDataTimeout = RELOAD_DATA_TIMEOUT_MIN

var todayEvents = -1

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
        return '#cc1100'
    } else if (0 < count && count <= 4) {
        return '#c6e48b'
    } else if (4 < count && count <= 6) {
        return '#7bc96f'
    } else if (6 < count && count <= 10) {
        return '#239a3b'
    } else if (0 < count) {
        return '#196127'
    } else {
        return ''
    }
}

function scheduleRequest(cb) {
    loadJson(GITHUB_EVENTS_URL, function(err, data) {
        if (err) {
            reloadDataTimeout = Math.min(RELOAD_DATA_TIMEOUT_MAX, reloadDataTimeout * 2)
            return setTimeout(scheduleRequest, reloadDataTimeout)
        }
        reloadDataTimeout = RELOAD_DATA_TIMEOUT_MIN
        cb(data)
    })
}

function scheduleReloadUserData() {
    if (!loadingUserData) {
        loadingUserData = true
        scheduleRequest(function(events) {
            loadingUserData = false
            todayEvents = countTodayEvents(events)
            setTimeout(scheduleReloadUserData, RELOAD_DATA_TIMEOUT_REGULAR)
        })
    }
}

scheduleReloadUserData()

xBrowser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('get_color' == request.name) {
        sendResponse({error: undefined, color: eventColor(todayEvents), todayEvents: todayEvents})
        return true
    }
    return false
})
