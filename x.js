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

// =================== Cross-browser compatibility tricks =====================

var xBrowser = typeof chrome != 'undefined' ? chrome : browser

var xStore = xBrowser.storage.local

//
// TODO: probably should move to storage.sync later, like this:
//
// 		var xStore = typeof xBrowser.storage.sync != 'undefined' ? xBrowser.storage.sync : xBrowser.storage.local
//
// However, in FF 52 storage.sync is defined, but when you try to use it, and the user didn't enable it, an error occurs
//
