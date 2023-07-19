const $scriptInstanceTemplate = document.querySelector('template#script-instance')
const $resultInstanceTemplate = document.querySelector('template#result-instance')
const $noteInstanceTemplate = document.querySelector('template#note-instance')
const $newPlaybookItemInstanceTemplate = document.querySelector('template#new-playbook-item-instance')
const $playbookInstanceTemplate = document.querySelector('template#playbook-instance')
const $playbookContentInstanceTemplate = document.querySelector('template#playbook-content-instance')

chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === 'sidepanel-result') {

    console.log('GOT RESULT', data)

  } else if (name.startsWith('sidepanel-')) {
    console.log('SIDEPANEL: full text is', data.message)
    document.body.querySelector('#definition-word').innerText = `Selected part of block "${data.message}"`;
  }
});

document.querySelector('#add-new-script').addEventListener('click', (e) => {
  const scriptId = document.querySelector('#new-script-id').value
  const scriptContent = document.querySelector('#new-script-content').value

  const script = {
    type: 'js',
    id: scriptId,
    content: scriptContent,
  }

  chrome.storage.local.get(["scripts"]).then((result) => {
    chrome.storage.local.set({
      'scripts': [...(result.scripts ?? []), script]
    })
  });
})

document.querySelector('#add-new-note').addEventListener('click', (e) => {
  const noteId = Math.random().toString()
  const noteContent = document.querySelector('#new-note-content').value

  const note = {
    type: 'note',
    id: noteId,
    content: noteContent,
  }

  chrome.storage.local.get(["notes"]).then((result) => {
    chrome.storage.local.set({
      'notes': [...(result.notes ?? []), note]
    })
  });
})

function rerenderScripts() {
  chrome.storage.local.get(['scripts']).then((result) => {
    document.body.querySelector('#all-scripts').innerHTML = ''
    for (let i = 0; i < result.scripts.length; i++) {
      const scriptInstance = $scriptInstanceTemplate.cloneNode(true)
      scriptInstance.content.firstElementChild.setAttribute('data-script-id', result.scripts[i].id)
      scriptInstance.content.querySelector('#script-id').innerText = result.scripts[i].id
      scriptInstance.content.querySelector('#script-type').innerText = result.scripts[i].type
      scriptInstance.content.querySelector('#script-content').innerText = result.scripts[i].content
      document.body.querySelector('#all-scripts').appendChild(scriptInstance.content.firstElementChild)
    }
  })
}

function rerenderPlaybooks() {
  chrome.storage.local.get(['playbooks']).then((result) => {
    document.body.querySelector('#all-playbooks').innerHTML = ''
    for (let i = 0; i < result.playbooks.length; i++) {
      const playbookInstance = $playbookInstanceTemplate.cloneNode(true)
      playbookInstance.content.firstElementChild.setAttribute('data-playbook-id', result.playbooks[i].id)
      playbookInstance.content.querySelector('#playbook-id').innerText = result.playbooks[i].id

      debugger
      for (let j = 0; j < result.playbooks[i].content.length; j++) {
        const content = result.playbooks[i].content[j]
        const playbookContentInstance = $playbookContentInstanceTemplate.cloneNode(true)
        playbookContentInstance.content.querySelector('#playbook-content-type').innerText = content.type
        playbookContentInstance.content.querySelector('#playbook-content-value').innerText = content.value

        playbookInstance.content.querySelector('#playbook-content').appendChild(playbookContentInstance.content.firstElementChild)
      }

      
      document.body.querySelector('#all-playbooks').appendChild(playbookInstance.content.firstElementChild)
    }
  })
}

function rerenderResults() {
  chrome.storage.local.get(['results']).then((result) => {
    document.body.querySelector('#all-results').innerHTML = ''
    for (let i = 0; i < result.results.length; i++) {
      const resultInstance = $resultInstanceTemplate.cloneNode(true)
      resultInstance.content.querySelector('#script-id').innerText = result.results[i].scriptId
      resultInstance.content.querySelector('#start-time').innerText = result.results[i].startTime
      resultInstance.content.querySelector('#end-time').innerText = result.results[i].endTime
      resultInstance.content.querySelector('#tab-id').innerText = result.results[i].tabId
      resultInstance.content.querySelector('#tab-href').innerText = result.results[i].tabHref
      resultInstance.content.querySelector('#result-content').innerText = result.results[i].returnValue
      resultInstance.content.querySelector('#result-logs').innerText = result.results[i].logs.join(',')
      resultInstance.content.querySelector('#tab-before-screenshot').src = result.results[i].beforeScreenshotDataUrl
      resultInstance.content.querySelector('#tab-screenshot').src = result.results[i].screenshotDataUrl
      document.body.querySelector('#all-results').appendChild(resultInstance.content.firstElementChild)
    }
  })
}

function rerenderNotes() {
  chrome.storage.local.get(['notes']).then((result) => {
    document.body.querySelector('#all-notes').innerHTML = ''
    for (let i = 0; i < result.notes.length; i++) {
      const noteInstance = $noteInstanceTemplate.cloneNode(true)
      noteInstance.content.firstElementChild.setAttribute('data-note-id', result.notes[i].id)
      noteInstance.content.querySelector('#note-content').innerText = result.notes[i].content
      document.body.querySelector('#all-notes').appendChild(noteInstance.content.firstElementChild)
    }
  })
}

document.querySelector('#all-results').addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-id')) {
    const tabId = e.target.closest('.result-instance').querySelector('#tab-id').innerText
    chrome.tabs.update(parseInt(tabId), {
      active: true,
    })
  }
})

document.querySelector('#all-notes').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-note')) {
    const id = e.target.closest('.note-instance').getAttribute('data-note-id')
  
    debugger
  
    let newNotes = []
  
    chrome.storage.local.get(['notes']).then((result) => {
      for (let i = 0; i < result.notes.length; i++) {
        if (result.notes[i].id.toString() === id.toString()) {
          // ignore
        } else {
          newNotes.push(result.notes[i])
        }
      }
  
      chrome.storage.local.set({
        'notes': newNotes,
      })
    })
  }
})

document.querySelector('#all-playbooks').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-playbook')) {
    const id = e.target.closest('.playbook-instance').getAttribute('data-playbook-id')
  
    let newPlaybooks = []
  
    chrome.storage.local.get(['playbooks']).then((result) => {
      for (let i = 0; i < result.playbooks.length; i++) {
        if (result.playbooks[i].id.toString() === id.toString()) {
          // ignore
        } else {
          newPlaybooks.push(result.playbooks[i])
        }
      }
  
      chrome.storage.local.set({
        'playbooks': newPlaybooks,
      })
    })
  } else if (e.target.classList.contains('run-playbook')) {
    const id = e.target.closest('.playbook-instance').getAttribute('data-playbook-id')
  
    chrome.storage.local.get(['playbooks']).then((result) => {
      for (let i = 0; i < result.playbooks.length; i++) {
        if (result.playbooks[i].id.toString() === id.toString()) {



          result.playbooks[i].content.forEach((content) => {
            if (content.type === 'script') {
              runScript(content.value)
            } else if (content.type === 'instruction') {

            }
          })
        }
      }
    })
  }
})



document.querySelector('#all-scripts').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-script')) {
    const id = e.target.closest('.script-instance').getAttribute('data-script-id')

    let newScripts = []

    chrome.storage.local.get(['scripts']).then((result) => {
      for (let i = 0; i < result.scripts.length; i++) {
        if (result.scripts[i].id === id) {
          // ignore
        } else {
          newScripts.push(result.scripts[i])
        }
      }

      chrome.storage.local.set({
        'scripts': newScripts,
      })
    })
  }

  if (e.target.classList.contains('run-script')) {
    const id = e.target.closest('.script-instance').getAttribute('data-script-id')
    runScript(id)
  }
})

function runScript(id) {
  chrome.storage.local.get(['scripts']).then((result) => {
    for (let i = 0; i < result.scripts.length; i++) {
      if (result.scripts[i].id === id) {
        console.log('should run script', result.scripts[i])
        async function execInPage(code) {

          chrome.tabs.captureVisibleTab(async function(beforeScreenshotDataUrl) {
            

            const [tab] = await chrome.tabs.query({currentWindow: true, active: true});
            const rrr = chrome.scripting.executeScript({
              target: {tabId: tab.id},
              func: code => {
                const startTime = Date.now()

                console.stdlog = console.log.bind(console);
                console.logs = [];
                console.log = function(){
                    console.logs.push(Array.from(arguments));
                    console.stdlog.apply(console, arguments);
                }

                const el = document.createElement('script');
                el.textContent = code;
                document.documentElement.appendChild(el);
                el.remove();
                console.log = console.stdlog
                // return window.$lastResult

                return {
                  returnValue: window.$lastResult,
                  startTime,
                  endTime: Date.now(),
                  tabHref: location.href,
                  logs: console.logs,
                }
              },
              args: [code],
              world: 'MAIN',
            });

            

            rrr.then((result) => {

              chrome.tabs.captureVisibleTab(function(screenshotDataUrl) {
                chrome.storage.local.get(["results"]).then((r) => {
                  chrome.storage.local.set({
                    'results': [...(r.results ?? []), {
                      ...result[0].result,
                      scriptId: id,
                      tabId: tab.id,
                      screenshotDataUrl,
                      beforeScreenshotDataUrl,
                    }]
                  })
                });
              });
            })

          })
        }
        
        execInPage(`
          window.$tempResult = (function() {${result.scripts[i].content}})()
          if (window.$tempResult instanceof HTMLElement) {
            window.$lastResult = window.$tempResult.outerHTML
          } else if (Array.isArray(window.$tempResult)) {
            window.$lastResult = window.$tempResult
          } else if (typeof window.$tempResult === 'object') {
            window.$lastResult = JSON.stringify(window.$tempResult)
          } else {
            window.$lastResult = window.$tempResult
          }
        `);
      }
    }
  })
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  // rerenderNotes()
  rerenderScripts()
  rerenderResults()
  rerenderPlaybooks()
});

document.querySelector('#delete-all').addEventListener('click', () => {
  chrome.storage.local.clear()
})

document.querySelector('#clear-results').addEventListener('click', () => {
  chrome.storage.local.remove('results')
})

// rerenderNotes()
rerenderScripts()
rerenderResults()
rerenderPlaybooks()

document.querySelector('#new-playbook-item-holder').replaceChildren($newPlaybookItemInstanceTemplate.cloneNode(true).content.firstElementChild)

document.querySelector('#add-new-playbook-item').addEventListener('click', () => {
  document.querySelector('#new-playbook-item-holder').appendChild($newPlaybookItemInstanceTemplate.cloneNode(true).content.firstElementChild)
})

document.querySelector('#save-new-playbook').addEventListener('click', () => {

  const newPlaybookItemHolder = document.querySelector('#new-playbook-item-holder')
  const c = Array.from(newPlaybookItemHolder.children)
  const content = []

  for (let i = 0; i < c.length; i++) {
    const type = c[i].querySelector('select').value
    const value = c[i].querySelector('input').value
    content.push({ type, value })
  }

  chrome.storage.local.get(["playbooks"]).then((result) => {
    chrome.storage.local.set({
      'playbooks': [...(result.playbooks ?? []), {
        id: Math.random().toString(),
        content,
      }]
    })
  });

  document.querySelector('#new-playbook-item-holder').replaceChildren($newPlaybookItemInstanceTemplate.cloneNode(true).content.firstElementChild)
})


document.querySelector('#start-draw').addEventListener('click', (e) => {
  chrome.tabs.query({
    "active": true,
  }).then((tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      name: `tab-start-draw`,
    });
  })
})

document.querySelector('#stop-draw').addEventListener('click', (e) => {
  chrome.tabs.query({
    "active": true,
  }).then((tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      name: `tab-stop-draw`,
    });
  })
})

