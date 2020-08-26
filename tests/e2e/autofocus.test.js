import { Selector } from 'testcafe'


fixture('v-hotkey')
    .page('http://localhost:8080/')


test('maps hotkeys to click events', async t => {
    await t
        .click('#clear-reported')
        .pressKey('ctrl+s')
        .expect(Selector('#reported').textContent).eql('Ctrl-S:click')
})

test('maps hotkeys to function calls', async t => {
    const checkbox = Selector('#checkbox')

    await t
        .pressKey('ctrl+d')
        .expect(checkbox.checked).eql(true)
        .pressKey('ctrl+d')
        .expect(checkbox.checked).eql(false)

        .pressKey('/')
        .expect(Selector('#search').focused).eql(true)
})