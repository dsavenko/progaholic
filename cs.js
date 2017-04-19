
var UPDATE_DELAY = 1000 * 60 // 1 min

var div = null
var oldEvents = -1

function createBorderDiv() {
    div = document.createElement('div')
    div.style.zIndex = '2147483647'
    div.style.position = 'fixed'
    div.style.top = '0'
    div.style.left = '0'
    div.style.width = '10px'
    div.style.height = '100%'
    document.documentElement.appendChild(div)
}

function setBorder(color, todayEvents) {
    if (!div) {
        createBorderDiv()
    }
    div.title = '' + todayEvents + ' contribution' + (1 == todayEvents ? '' : 's') + ' today'
    div.style.backgroundColor = color
}

function update() {
    xBrowser.runtime.sendMessage({name: 'get_color'}, function(resp) {
        if (resp.error) {
            console.log('Error loading GitHub', resp.error)
        } else if (oldEvents != resp.todayEvents) {
            oldEvents = resp.todayEvents
            setBorder(resp.color, resp.todayEvents)
        }
        setTimeout(update, UPDATE_DELAY)
    })
}

update()
