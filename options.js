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

function saveConfig(e) {
    e.preventDefault()
    var newColors = []
    var newCounts = []
    for (var i = 0; i < 5; ++i) {
        newColors.push(document.getElementById('color_' + i).value)
        if (i < 4) {
            newCounts.push(document.getElementById('count_' + i).value)
        }
    }
    var newConfig = {
        github_username: document.getElementById('github_username').value,
        github_token: document.getElementById('github_token').value,
        colors: newColors,
        counts: newCounts
    }
    xBrowser.runtime.sendMessage({name: 'set_config', config: newConfig}, function(resp) {
        // Update status to let user know options were saved.
        var status = document.getElementById('status')
        status.textContent = 'Options saved.'
        setTimeout(function() {
            status.textContent = ''
        }, 750)
    })
}

function restoreConfig() {
    xBrowser.runtime.sendMessage({name: 'get_config'}, function(resp) {
        var config = resp.config
        document.getElementById('github_username').value = config.github_username
        document.getElementById('github_token').value = config.github_token
        for (var i = 0; i < 5; ++i) {
            document.getElementById('color_' + i).value = config.colors[i]
            if (i < 4) {
                document.getElementById('count_' + i).value = config.counts[i]
            }
        }
    })
}

document.addEventListener('DOMContentLoaded', restoreConfig)
document.getElementById('save').addEventListener('click', saveConfig)
