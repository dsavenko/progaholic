
xBrowser.runtime.sendMessage({name: 'get_color'}, function(resp) {
    if (resp.error) {
        console.log('Error loading GitHub', resp.error)
    } else {
        document.body.style.border = '5px solid ' + resp.color
    }
})
