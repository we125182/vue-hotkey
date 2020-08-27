import { Selector } from 'testcafe'

const
    reported = Selector('#reported'),
    clear = '#clear-reported'


fixture('v-hotkey')
    .page('http://localhost:8080/')


test('dispatches click events', async t => {
    const
        hotkey = 'Ctrl+S',
        modifiers = ['Ctrl+', 'Alt+', 'Shift+', 'Ctrl+Alt+', 'Ctrl+Shift+', 'Alt+Shift+', 'Ctrl+Alt+Shift+']

    await t
        .pressKey(hotkey)
        .expect(reported.textContent).eql(hotkey)

    modifiers.forEach(async modifier => {
        await t
            .click(clear)
            .pressKey(modifier + 'Enter')
            .expect(reported.textContent).eql(modifier + 'Enter')
    })
})


test('dispatches other events', async t => {
    const
        hotkeys = ['Ctrl+G', 'Alt+G']

    hotkeys.forEach(async hotkey => {
        await t
            .click(clear)
            .pressKey(hotkey)
            .expect(reported.textContent).eql(hotkey)
    })
})


test('calls functions', async t => {
    const
        checkbox = Selector('#toggling'),
        hotkey = 'ctrl+k'

    await t
        .pressKey(hotkey)
        .expect(checkbox.checked).eql(true)
        .pressKey(hotkey)
        .expect(checkbox.checked).eql(false)

        .pressKey('/')
        .expect(Selector('#search').focused).eql(true)
})


test('permits plain-character hotkeys to be entered in input and contenteditable elements', async t => {
    const
        inputs = [Selector('#search'), Selector('#contenteditable')]

    inputs.forEach(async s => {
        await t
            .typeText(s, '/', { replace: true })
            .expect(s.textContent).eql('/')
    })
})


test('recognizes multiple hotkeys mapped to the same event', async t => {
    const
        hotkeys = ['alt+a', 'alt+b', 'alt+c']

    hotkeys.forEach(async hotkey => {
        await t
            .click(clear)
            .pressKey(hotkey)
            .expect(reported.textContent).eql('Alt+A/B/C')
    })
})


test('can be enabled/disabled', async t => {
    const
        toggle = 'ctrl+e',
        button = 'Ctrl+Shift+E'

    await t
        .pressKey(button)
        .expect(reported.textContent).eql('')

        .pressKey(toggle)
        .pressKey(button)
        .expect(reported.textContent).eql(button)

        .click(clear)
        .pressKey(toggle)
        .pressKey(button)
        .expect(reported.textContent).eql('')
})


test('can enable/disable multiple directives on the same element', async t => {
    const
        toggle = 'alt+d',
        hotkeys = ['Ctrl+F1', 'Ctrl+F2'],
        expected = [hotkeys, ['', ''], hotkeys]

    expected.forEach(async e => {
        hotkeys.forEach(async (k, index) => {
            await t
                .click(clear)
                .pressKey(k)
                .expect(reported.textContent).eql(e[index])
        })

        await t
            .pressKey(toggle)
    })
})


test('respects the priority among multiple events mapped to the same hotkey', async t => {
    const
        hotkey = 'Ctrl+O'

    await t
        .pressKey(hotkey)
        .expect(reported.textContent).eql(hotkey + '#3')
})


test('performs actions inside components', async t => {
    const
        components = [
            { type: 'confirm', hotkeys: ['N', 'Y'] },
            { type: 'dialog', hotkeys: ['Ctrl+O', 'Ctrl+X'] },
        ]

    components.forEach(async c => {
        c.hotkeys.forEach(async k => {
            await t
                .click(clear)
                .click('#' + c.type)
                .expect(Selector('.md-dialog').exists).eql(true)

                .pressKey(k)
                .expect(reported.textContent).eql(`${k}:${c.type}`)
        })
    })
})