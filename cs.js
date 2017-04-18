
function setBorder(color, todayEvents) {
    var div = document.createElement('div')
    div.title = '' + todayEvents + ' contribution' + (1 == todayEvents ? '' : 's') + ' today'
    div.style.backgroundColor = color
    div.style.zIndex = '2147483647'
    div.style.position = 'fixed'
    div.style.top = '0'
    div.style.left = '0'
    div.style.width = '10px'
    div.style.height = '100%'
    document.documentElement.appendChild(div)
}

xBrowser.runtime.sendMessage({name: 'get_color'}, function(resp) {
    if (resp.error) {
        console.log('Error loading GitHub', resp.error)
    } else if ('' != resp.color) {
        setBorder(resp.color, resp.todayEvents)
    }
})
