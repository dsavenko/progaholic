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

var UPDATE_DELAY = 1000 * 60 // 1 min

var oldEvents = -1

var TOP = 0
var RIGHT = 1
var BOTTOM = 2
var LEFT = 3

var borderDivs = null

function createBorderDiv(position, thickness) {
    var div = document.createElement('div')
    div.style.zIndex = '2147483647'
    div.style.position = 'fixed'
    switch (position) {
    case LEFT:
        div.style.top = '0'
        div.style.left = '0'
        div.style.width = thickness + 'px'
        div.style.height = '100%'
        break;

    case RIGHT:
        div.style.top = '0'
        div.style.right = '0'
        div.style.width = thickness + 'px'
        div.style.height = '100%'
        break;

    case TOP:
        div.style.top = '0'
        div.style.left = '0'
        div.style.height = thickness + 'px'
        div.style.width = '100%'
        break;

    case BOTTOM:
        div.style.bottom = '0'
        div.style.left = '0'
        div.style.height = thickness + 'px'
        div.style.width = '100%'
        break;
    }
    document.documentElement.appendChild(div)
    return div
}

function createBorderDivs(borders) {
    borderDivs = []
    borderDivs.push(createBorderDiv(TOP, borders[TOP]))
    borderDivs.push(createBorderDiv(RIGHT, borders[RIGHT]))
    borderDivs.push(createBorderDiv(BOTTOM, borders[BOTTOM]))
    borderDivs.push(createBorderDiv(LEFT, borders[LEFT]))
}

function setBorder(color, todayEvents) {
    for (var i = 0; i < borderDivs.length; ++i) {
        var div = borderDivs[i]
        div.title = '' + todayEvents + ' contribution' + (1 == todayEvents ? '' : 's') + ' today'
        div.style.backgroundColor = color
    }
}

function update() {
    xBrowser.runtime.sendMessage({name: 'get_color'}, function(resp) {
        if (!resp) {
            console.log('Error contacting the background script')
        } else if (resp.error) {
            console.log('Error loading GitHub', resp.error)
        } else if (oldEvents != resp.todayEvents) {
            oldEvents = resp.todayEvents
            if (null == borderDivs) {
                createBorderDivs(resp.config.borders)
            }
            setBorder(resp.color, resp.todayEvents)
        }
        setTimeout(update, UPDATE_DELAY)
    })
}

update()
