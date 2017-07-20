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

var RELOAD_DATA_TIMEOUT = 1000 * 60 * 6 // 6 mins

var todayEvents = -1

var partialTodayEvents = -1
var requestCount = -1

var DEFAULT_GITHUB_URL = 'https://api.github.com/'
var DEFAULT_GITLAB_URL = 'https://gitlab.com/'
var DEFAULT_BITBUCKET_URL = 'https://api.bitbucket.org/'

var config = {
    accounts: [{
        service: 'github',
        username: '',
        token: '',
        url: ''
    }],
    colors: ['#cc1100', '#f1959c', '#7bc96f', '#239a3b', '#196127'],
    counts: [        0,         4,         6,        10],
    borders: [0, 0, 0, 10]
}

function loadUrl(url, callback, user, password) {
    var x = new XMLHttpRequest()
    x.open('GET', url)
    x.onload = function() {
        // OK statuses for us: 200 OK, 304 Not modified
        if (x.status == 200 || x.status == 304) {
            callback(undefined, x.responseText)
        } else {
            console.log('status: ' + x.statusText)
            callback(x.statusText)
        }
    }
    x.onerror = function(e) {
        callback(e)
    }
    if (user && password) {
        x.setRequestHeader('Authorization', 'Basic ' + btoa(user + ':' + password))
    }
    x.send()
}

function loadJson(url, callback, user, password) {
    loadUrl(url, function(e, txt) {
        if (e) {
            callback(e)
        } else {
            callback(undefined, JSON.parse(txt))
        }
    }, user, password)
}

function sameDay(d1, d2) {
    return d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear()
}

function countTodayEvents(events, createdFieldName) {
    var now = new Date()
    var ret = 0
    if (!createdFieldName) {
        createdFieldName = 'created_at'
    }
    for (var i = 0; i < events.length; ++i) {
        var created = new Date(events[i][createdFieldName])
        if (!sameDay(now, created)) {
            break
        }
        ++ret
    }
    return ret
}

function eventColor(count) {
    if (0 > count) {
        return ''
    }
    for (var i = config.counts.length - 1; i >= 0; --i) {
        if (count > config.counts[i]) {
            return config.colors[i+1]
        }
    }
    return config.colors[0]
}

function sanitizeUrl(url, defaultUrl) {
    var u = url ? url.trim() : defaultUrl
    if (!u.endsWith('/')) {
        u = u + '/'
    }
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
        u = 'https://' + u
    }
    return u
}

function encode(t) {
    return encodeURIComponent(t)
}

function encodeIf(prefix, t) {
    return '' == t ? '' : prefix + encode(t)
}

function createGitlabIdUrl(url, username, accessToken) {
    return sanitizeUrl(url, DEFAULT_GITLAB_URL) + 'api/v4/users?username=' + encode(username) + encodeIf('&private_token=', accessToken)
}

function createGitlabEventsUrl(url, id, accessToken) {
    return sanitizeUrl(url, DEFAULT_GITLAB_URL) + 'api/v4/users/' + encode(id) + '/events' + encodeIf('?private_token=', accessToken)
}

function createGithubEventsUrl(url, username, accessToken) {
    return sanitizeUrl(url, DEFAULT_GITHUB_URL) + 'users/' + encode(username) + '/events' + encodeIf('?accessToken=', accessToken)
}

function createBitbucketEventsUrl(url, username) {
    return sanitizeUrl(url, DEFAULT_BITBUCKET_URL) + '1.0/users/' + encode(username) + '/events'
}

function scheduleRequest(account, cb) {
    var url = ''
    if ('github' == account.service) {
        if ('' != account.username) {
            url = createGithubEventsUrl(account.url, account.username, account.token)
        } else {
            return cb(undefined, 0)
        }
        loadJson(url, function(err2, data) {
            if (err2) {
                return cb(err2)
            } else {
                cb(undefined, countTodayEvents(data))
            }
        })
    } else if ('bitbucket' == account.service) {
        if ('' != account.username) {
            url = createBitbucketEventsUrl(account.url, account.username)
        } else {
            return cb(undefined, 0)
        }
        loadJson(url, function(err2, data) {
            if (err2) {
                return cb(err2)
            } else {
                cb(undefined, countTodayEvents(data.events, 'utc_created_on'))
            }
        }, account.username, account.token)
    } else if ('gitlab' == account.service) {
        if ('' != account.username) {
            url = createGitlabIdUrl(account.url, account.username, account.token)
        } else {
            return cb(undefined, 0)
        }
        loadJson(url, function(err2, data) {
            if (err2) {
                return cb(err2)
            } else {
                if (data && data.length && 0 < data.length && data[0] && data[0].id) {
                    var eventsUrl = createGitlabEventsUrl(account.url, data[0].id, account.token)
                    loadJson(eventsUrl, function(err3, data2) {
                        if (err3) {
                            return cb(err3)
                        } else {
                            cb(undefined, countTodayEvents(data2))
                        }
                    })
                } else {
                    cb('GitLab user not found')
                }                
            }
        })
    } else {
        return cb('Unsupported service ' + account.service)
    }
}

function loadingUserData() {
    return 0 < requestCount
}

function scheduleReloadUserData(singleShot) {
    if (loadingUserData()) {
        return
    }
    accounts = config.accounts
    if (0 >= accounts.length) {
        todayEvents = 0
        if (!singleShot) {
            setTimeout(scheduleReloadUserData, RELOAD_DATA_TIMEOUT)
        }
        return
    }
    partialTodayEvents = 0
    requestCount = accounts.length
    for (var i = 0; i < accounts.length; ++i) {
        scheduleRequest(accounts[i], function(err, eventCount) {
            if (err) {
                console.log('Error making request to an account', err)
            } else {
                partialTodayEvents += eventCount
            }
            requestCount -= 1
            if (0 == requestCount) {
                todayEvents = partialTodayEvents
                if (!singleShot) {
                    setTimeout(scheduleReloadUserData, RELOAD_DATA_TIMEOUT)
                }
            }
        })
    }
}

function loadConfig(cb) {
    xStore.get({config: ''}, function(x) {
        loadedConfig = x.config
        if ('' != loadedConfig) {
            config = JSON.parse(loadedConfig)
        }
        if (cb) {
            cb(config)
        }
    })    
}

function sanitizeConfig(cfg) {
    for (var i = 0; i < cfg.accounts.length; ++i) {
        cfg.accounts[i].username = cfg.accounts[i].username.trim()
    }
}

function saveConfig(newConfig, cb) {
    sanitizeConfig(newConfig)
    xStore.set({config: JSON.stringify(newConfig)}, function() {
        config = newConfig
        scheduleReloadUserData(true)
        cb()
    })
}

function noAccounts(cfg) {
    for (var i = 0; i < cfg.accounts.length; ++i) {
        if ('' != cfg.accounts[i].username) {
            return false
        }
    }
    return true
}

xBrowser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('get_color' == request.name) {
        sendResponse({error: undefined, color: eventColor(todayEvents), todayEvents: todayEvents, config: config})
        return true
    } else if ('set_config' == request.name) {
        saveConfig(request.config, function() {
            sendResponse({error: undefined})
        })
        return true
    } else if ('get_config' == request.name) {
        sendResponse({error: undefined, config: config})
        return true
    }
    return false
})

loadConfig(function(cfg) {
    if (noAccounts(cfg)) {
        xBrowser.runtime.openOptionsPage()
    }
    scheduleReloadUserData()
})
